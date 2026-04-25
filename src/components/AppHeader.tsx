import { createSupabaseServerClient } from '@/lib/supabase-server';
import { signOut } from '@/app/actions/auth';
import Link from 'next/link';
import styles from './AppHeader.module.css';

export default async function AppHeader() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden>
          <rect width="28" height="28" rx="8" fill="#3b82f6" />
          <rect x="6" y="6" width="7" height="7" rx="1.5" fill="#fff" />
          <rect x="15" y="6" width="7" height="7" rx="1.5" fill="#fff" fillOpacity=".6" />
          <rect x="6" y="15" width="7" height="7" rx="1.5" fill="#fff" fillOpacity=".6" />
          <rect x="15" y="15" width="7" height="7" rx="1.5" fill="#fff" />
        </svg>
        <span className={styles.brandName}>WorkSpace</span>
      </Link>

      <nav className={styles.nav}>
        {user ? (
          <>
            <Link href="/bookings" className={styles.navLink}>My Bookings</Link>
            <form action={signOut}>
              <button type="submit" className={styles.signOutBtn}>Sign Out</button>
            </form>
          </>
        ) : (
          <Link href="/auth" className={styles.navLink}>Sign In</Link>
        )}
      </nav>
    </header>
  );
}
