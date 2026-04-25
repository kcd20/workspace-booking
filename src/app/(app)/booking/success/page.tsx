import Link from 'next/link';
import styles from './page.module.css';

export default function BookingSuccessPage() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.icon}>✓</div>
        <h1 className={styles.heading}>Booking Confirmed!</h1>
        <p className={styles.body}>
          Your payment was successful. A confirmation will be sent to your email shortly.
        </p>
        <Link href="/book" className={styles.link}>Back to Floor Plan</Link>
      </div>
    </main>
  );
}
