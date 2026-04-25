# FlowSpace

A coworking space booking app with real-time seat availability, Stripe payments, and email confirmations.

**Live demo:** [workspace-booking-three.vercel.app](https://workspace-booking-three.vercel.app)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Compiler)
- **Database:** Supabase (Postgres + Realtime + RLS)
- **Payments:** Stripe Checkout
- **Email:** Resend
- **Hosting:** Vercel

---

## Features

- **Interactive floor plan** — SVG floor plan showing real-time availability across 4 zones (hot desks, quiet zone, private offices, meeting rooms)
- **Timeslot picker** — select date, start time, and duration before browsing availability
- **Stripe payment flow** — bookings are held as pending until payment is confirmed via webhook
- **Live updates** — Supabase Realtime pushes availability changes to all connected users instantly
- **Confirmation email** — receipt sent after payment with a one-click cancellation link
- **Full refunds** — cancellations issue a Stripe refund and immediately free the slot
- **My Bookings** — secure magic-link login (via email) to view booking history

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode is fine)
- A [Resend](https://resend.com) account
- [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook forwarding

### 1. Install dependencies

```bash
yarn install
```

### 2. Set up the database

Run the following in your Supabase SQL editor, in order:

1. `supabase/schema.sql` — creates the `spaces` and `bookings` tables with RLS
2. `supabase/seed.sql` — inserts the 30 spaces shown on the floor plan

### 3. Configure environment variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_APP_URL=http://localhost:3000

RESEND_API_KEY=re_...
MY_BOOKINGS_SECRET=<random secret, generate with: openssl rand -base64 32>
```

### 4. Start the Stripe webhook listener

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret it prints and set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### 5. Run the dev server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```text
Browser
  │
  ├── FloorPlan (client component)
  │     ├── Fetches booked slot IDs from Supabase on timeslot change
  │     └── Subscribes to Supabase Realtime for live updates
  │
  ├── BookingPanel (client component)
  │     └── Calls createBooking server action → redirects to Stripe Checkout
  │
Stripe Checkout (hosted)
  │
  └── POST /api/webhooks/stripe
        ├── checkout.session.completed → confirms booking, sends confirmation email
        └── checkout.session.expired  → cancels booking
```

**Booking lifecycle:**
`pending` (created) → `confirmed` (payment received) → `cancelled` (refunded or expired)

---

## Test Payments

Use Stripe's test card in Checkout:

| Field       | Value                  |
| ----------- | ---------------------- |
| Card number | `4242 4242 4242 4242`  |
| Expiry      | Any future date        |
| CVC         | Any 3 digits           |

---

## Deployment

The app is deployed on Vercel. To deploy your own instance:

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local`
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
5. Create a production Stripe webhook pointing to `https://<your-domain>/api/webhooks/stripe` with the `checkout.session.completed` and `checkout.session.expired` events

> **Note:** Resend requires a verified custom domain to send emails to arbitrary addresses. Without one, emails are restricted to your own verified address.
