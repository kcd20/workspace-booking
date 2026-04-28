import AppHeader from '@/components/AppHeader';
import Link from 'next/link';
import styles from './page.module.css';

const ZONES = [
  {
    id: 'hot-desks',
    name: 'Hot Desks',
    count: 16,
    priceFrom: 15,
    capacity: '1 person',
    description: 'Open-plan workstations with fast WiFi and adjustable seating. Perfect for solo work and creative collaboration.',
    gradient: 'linear-gradient(160deg, #7c2d12 0%, #1c0a00 100%)',
    image: '/hot-desk.png',
    overlay: 'rgba(100, 35, 0, 0.82)',
    accent: '#fb923c',
  },
  {
    id: 'quiet-zone',
    name: 'Quiet Zone',
    count: 8,
    priceFrom: 20,
    capacity: '1 person',
    description: 'Noise-restricted desks designed for deep focus. No calls permitted. Just you and your best thinking.',
    gradient: 'linear-gradient(160deg, #065f46 0%, #022c22 100%)',
    image: '/quiet-zone.png',
    overlay: 'rgba(2, 44, 34, 0.82)',
    accent: '#34d399',
  },
  {
    id: 'private-offices',
    name: 'Private Offices',
    count: 3,
    priceFrom: 45,
    capacity: 'Up to 4 people',
    description: 'Fully enclosed, lockable offices for confidential work or small teams. Furnished and ready from day one.',
    gradient: 'linear-gradient(160deg, #1e3a8a 0%, #0d1e5c 100%)',
    image: '/private-office.png',
    overlay: 'rgba(13, 30, 92, 0.82)',
    accent: '#60a5fa',
  },
  {
    id: 'meeting-rooms',
    name: 'Meeting Rooms',
    count: 2,
    priceFrom: 75,
    capacity: 'Up to 10 people',
    description: 'AV-equipped rooms for presentations, client meetings, and team standups. Whiteboards and video conferencing included.',
    gradient: 'linear-gradient(160deg, #4c1d95 0%, #1a0330 100%)',
    image: '/meeting-room.png',
    overlay: 'rgba(26, 3, 48, 0.82)',
    accent: '#a78bfa',
  },
];

export default function LandingPage() {
  return (
    <div className={styles.root}>
      <AppHeader />
      <div className={styles.page}>

      {/* Hero */}
      <section className={`${styles.section} ${styles.hero}`}>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Premium Coworking</p>
            <h1 className={styles.heroTitle}>Work<span className={styles.heroTitleLight}>Space</span></h1>
            <p className={styles.heroTagline}>
              Move from drop-in focus sessions to client-ready meeting rooms without changing your rhythm.
            </p>
            <div className={styles.heroActions}>
              <Link href="/book" className={styles.heroCta}>Book a Space</Link>
              <p className={styles.heroMeta}>Open daily · Instant confirmation · From $15/hr</p>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <strong>29</strong>
                <span>desks and rooms ready now</span>
              </div>
              <div className={styles.heroStat}>
                <strong>4.9/5</strong>
                <span>rated for comfort and focus</span>
              </div>
              <div className={styles.heroStat}>
                <strong>5 min</strong>
                <span>from booking to check-in</span>
              </div>
            </div>
          </div>

          <div className={styles.heroShowcase} aria-hidden="true">
            <div className={styles.heroOrb} />
          </div>
        </div>
        <p className={styles.scrollHint}>Scroll to explore</p>
      </section>

      {/* Zone sections */}
      {ZONES.map(zone => (
        <section
          key={zone.id}
          className={styles.section}
          style={zone.image ? {
            backgroundImage: `linear-gradient(to right, ${zone.overlay} 0%, ${zone.overlay} 45%, rgba(0,0,0,0.25) 100%), url(${zone.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : { background: zone.gradient }}
        >
          <div className={styles.zoneContent}>
            <p className={styles.zoneEyebrow} style={{ color: zone.accent }}>
              {zone.count} spaces · From ${zone.priceFrom}/hr
            </p>
            <h2 className={styles.zoneName}>{zone.name}</h2>
            <p className={styles.zoneDesc}>{zone.description}</p>
            <p className={styles.zoneCapacity}>{zone.capacity}</p>
            <Link href="/book" className={styles.zoneLink} style={{ color: zone.accent }}>
              View availability →
            </Link>
          </div>
        </section>
      ))}

      </div>
    </div>
  );
}
