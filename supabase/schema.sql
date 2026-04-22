-- Run this in the Supabase SQL editor once to set up the schema.
-- NOTE: RLS is disabled for now; enable it when Supabase Auth is wired up.

create table if not exists spaces (
  id             text primary key,
  label          text not null,
  type           text not null check (type in ('desk', 'office', 'meeting-room')),
  zone_id        text not null,
  capacity       integer not null default 1,
  price_per_hour numeric(10, 2) not null,
  x              integer not null,
  y              integer not null,
  width          integer not null,
  height         integer not null,
  created_at     timestamptz not null default now()
);

create table if not exists bookings (
  id                uuid primary key default gen_random_uuid(),
  space_id          text not null references spaces(id),
  booked_date       date not null,
  start_time        time not null,
  end_time          time not null,
  duration_hours    integer not null check (duration_hours > 0),
  total_price       numeric(10, 2) not null,
  -- 'pending'   → created, awaiting Stripe payment
  -- 'confirmed' → payment succeeded (or direct booking pre-Stripe)
  -- 'cancelled' → refunded / cancelled
  status            text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'cancelled')),
  stripe_session_id text unique,
  customer_email    text,
  customer_name     text,
  created_at        timestamptz not null default now()
);

-- Speeds up the availability query (space_id + date + status)
create index if not exists bookings_space_date_idx
  on bookings (space_id, booked_date, status);

-- Required for Supabase Realtime to broadcast row-level changes
alter table bookings replica identity full;
alter publication supabase_realtime add table bookings;

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table spaces  enable row level security;
alter table bookings enable row level security;

-- Anyone (anon / authenticated) can read spaces — it's public catalogue data.
create policy "spaces: public read"
  on spaces for select
  to anon, authenticated
  using (true);

-- Anyone can read bookings for availability checks and Realtime updates.
-- Sensitive columns (customer_email, customer_name) should be exposed via a
-- restricted view once auth is added; this is acceptable for the current MVP.
create policy "bookings: public read"
  on bookings for select
  to anon, authenticated
  using (true);

-- Writes (insert / update / delete) on bookings are only allowed via the
-- service role key used in server actions — no client-side write policies needed.
