import FloorPlan from '@/components/FloorPlan';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <rect width="28" height="28" rx="8" fill="#3b82f6" />
            <rect x="6" y="6" width="7" height="7" rx="1.5" fill="#fff" />
            <rect x="15" y="6" width="7" height="7" rx="1.5" fill="#fff" fillOpacity=".6" />
            <rect x="6" y="15" width="7" height="7" rx="1.5" fill="#fff" fillOpacity=".6" />
            <rect x="15" y="15" width="7" height="7" rx="1.5" fill="#fff" />
          </svg>
          <span className={styles.brandName}>FlowSpace</span>
        </div>
        <Link href="/bookings" className={styles.myBookings}>My Bookings</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <h1 className={styles.heading}>Find your space</h1>
          <p className={styles.subheading}>
            Click an available seat or room to book it. Green = available, red = booked.
          </p>
        </div>
        <FloorPlan />
      </main>
    </div>
  );
}
