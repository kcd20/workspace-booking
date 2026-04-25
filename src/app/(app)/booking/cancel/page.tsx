import { createClient } from '@supabase/supabase-js';
import { cancelBooking } from '@/app/actions/cancel';
import Link from 'next/link';
import styles from './page.module.css';

interface Props {
  searchParams: Promise<{ token?: string; err?: string }>;
}

const ERR_MESSAGES: Record<string, string> = {
  not_found:  'Booking not found.',
  ineligible: 'This booking has already been cancelled or is not eligible for a refund.',
  no_payment: 'No payment found for this booking.',
};

export default async function CancelPage({ searchParams }: Props) {
  const { token, err } = await searchParams;

  if (!token) return <InvalidLink />;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_name, booked_date, start_time, end_time, total_price, status, space_id, spaces(label)')
    .eq('cancel_token', token)
    .single();

  if (!booking) return <InvalidLink />;

  if (booking.status === 'cancelled') {
    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Already Cancelled</h1>
          <p className={styles.body}>This booking has already been cancelled.</p>
          <Link href="/book" className={styles.link}>Back to Floor Plan</Link>
        </div>
      </main>
    );
  }

  const dateStr = new Date(`${booking.booked_date}T${booking.start_time}`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // @ts-expect-error — Supabase join typing
  const spaceLabel = booking.spaces?.label ?? booking.space_id;

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Cancel Booking</h1>
        <p className={styles.body}>Are you sure you want to cancel? You will receive a full refund.</p>

        <table className={styles.table}>
          <tbody>
            <tr><td>Space</td><td>{spaceLabel}</td></tr>
            <tr><td>Date</td><td>{dateStr}</td></tr>
            <tr><td>Time</td><td>{booking.start_time} – {booking.end_time}</td></tr>
            <tr><td>Refund</td><td>${Number(booking.total_price).toFixed(2)}</td></tr>
          </tbody>
        </table>

        {err && <p className={styles.error}>{ERR_MESSAGES[err] ?? 'Something went wrong.'}</p>}

        <form action={cancelBooking.bind(null, token)}>
          <button type="submit" className={styles.cancelBtn}>Cancel & Refund</button>
        </form>
        <Link href="/book" className={styles.link}>Keep My Booking</Link>
      </div>
    </main>
  );
}

function InvalidLink() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Invalid Link</h1>
        <p className={styles.body}>This cancellation link is invalid or has expired.</p>
        <Link href="/book" className={styles.link}>Back to Floor Plan</Link>
      </div>
    </main>
  );
}
