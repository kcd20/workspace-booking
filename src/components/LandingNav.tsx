import { createSupabaseServerClient } from '@/lib/supabase-server';
import Link from 'next/link';
import styles from './LandingNav.module.css';

export default async function LandingNav() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>WorkSpace</Link>
      <div className={styles.links}>
        {user ? (
          <Link href="/bookings" className={styles.link}>My Bookings</Link>
        ) : (
          <Link href="/auth" className={styles.link}>Sign In</Link>
        )}
        <Link href="/book" className={styles.cta}>Book a Space</Link>
      </div>
    </nav>
  );
}
