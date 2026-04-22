import { createClient } from '@supabase/supabase-js';
import { sendBookingsLink } from '@/app/actions/send-bookings-link';
import { verifyToken } from '@/lib/bookings-token';
import Link from 'next/link';
import styles from './page.module.css';

interface Props {
  searchParams: Promise<{ token?: string; sent?: string }>;
}

export default async function BookingsPage({ searchParams }: Props) {
  const { token, sent } = await searchParams;

  if (token) {
    const email = verifyToken(token);
    if (!email) {
      return (
        <main className={styles.main}>
          <div className={styles.container}>
            <Header />
            <p className={styles.errorMsg}>This link has expired or is invalid. Please request a new one.</p>
            <Link href="/bookings" className={styles.lookupBtn} style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>Request New Link</Link>
          </div>
        </main>
      );
    }
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <Header />
          <p className={styles.emailNote}>Showing bookings for <strong>{email}</strong></p>
          <BookingResults email={email} />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Header />
        {sent ? (
          <div className={styles.sentBox}>
            <p className={styles.sentTitle}>Check your email</p>
            <p className={styles.sentBody}>We sent you a link to view your bookings. It expires in 1 hour.</p>
          </div>
        ) : (
          <>
            <p className={styles.intro}>Enter your email and we&apos;ll send you a secure link to view your bookings.</p>
            <form action={sendBookingsLink} className={styles.lookupForm}>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className={styles.emailInput}
              />
              <button type="submit" className={styles.lookupBtn}>Send Link</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

function Header() {
  return (
    <div className={styles.header}>
      <Link href="/" className={styles.back}>← Floor Plan</Link>
      <h1 className={styles.heading}>My Bookings</h1>
    </div>
  );
}

async function BookingResults({ email }: { email: string }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, booked_date, start_time, end_time, duration_hours, total_price, status, cancel_token, space_id, spaces(label)')
    .eq('customer_email', email)
    .in('status', ['confirmed', 'cancelled'])
    .order('booked_date', { ascending: false })
    .order('start_time', { ascending: false });

  if (!bookings || bookings.length === 0) {
    return <p className={styles.empty}>No bookings found for this email.</p>;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.list}>
      {bookings.map(b => {
        // @ts-expect-error — Supabase join typing
        const label = b.spaces?.label ?? b.space_id;
        const canCancel = b.status === 'confirmed' && b.booked_date >= today;

        const dateStr = new Date(`${b.booked_date}T${b.start_time}`).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });

        return (
          <div key={b.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <p className={styles.spaceLabel}>{label}</p>
                <p className={styles.slot}>{dateStr} · {b.start_time} – {b.end_time}</p>
              </div>
              <span className={`${styles.badge} ${styles[b.status]}`}>{b.status}</span>
            </div>
            <div className={styles.cardBottom}>
              <span className={styles.price}>${Number(b.total_price).toFixed(2)}</span>
              {canCancel && (
                <Link href={`/booking/cancel?token=${b.cancel_token}`} className={styles.cancelLink}>
                  Cancel & Refund
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
