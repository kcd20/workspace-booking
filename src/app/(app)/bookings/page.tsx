import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Link from 'next/link';
import styles from './page.module.css';

export default async function BookingsPage() {
  const supabaseAuth = await createSupabaseServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, booked_date, start_time, end_time, total_price, status, cancel_token, space_id, spaces(label)')
    .eq('customer_email', user!.email)
    .in('status', ['confirmed', 'cancelled'])
    .order('booked_date', { ascending: false })
    .order('start_time', { ascending: false });

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.heading}>My Bookings</h1>

        {!bookings || bookings.length === 0 ? (
          <p className={styles.empty}>No bookings yet.</p>
        ) : (
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
        )}
      </div>
    </main>
  );
}
