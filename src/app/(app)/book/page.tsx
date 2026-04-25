import FloorPlan from '@/components/FloorPlan';
import styles from './page.module.css';

export default function BookPage() {
  return (
    <div className={styles.page}>
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
