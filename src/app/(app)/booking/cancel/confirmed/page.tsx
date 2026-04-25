import Link from 'next/link';
import styles from '../page.module.css';

export default function CancelConfirmedPage() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Booking Cancelled</h1>
        <p className={styles.body}>Your booking has been cancelled and a full refund has been issued. It may take 5–10 business days to appear on your statement.</p>
        <Link href="/book" className={styles.link}>Back to Floor Plan</Link>
      </div>
    </main>
  );
}
