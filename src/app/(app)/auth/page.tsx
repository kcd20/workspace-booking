import { signIn, signUp } from '@/app/actions/auth';
import Link from 'next/link';
import styles from './page.module.css';

interface Props {
  searchParams: Promise<{ mode?: string; error?: string }>;
}

export default async function AuthPage({ searchParams }: Props) {
  const { mode, error } = await searchParams;
  const isSignUp = mode === 'signup';

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.heading}>{isSignUp ? 'Create Account' : 'Sign In'}</h1>

        <form action={isSignUp ? signUp : signIn} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
          </div>

          {error && <p className={styles.error}>{decodeURIComponent(error)}</p>}

          <button type="submit" className={styles.submitBtn}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className={styles.toggle}>
          {isSignUp ? (
            <>Already have an account? <Link href="/auth">Sign in</Link></>
          ) : (
            <>No account? <Link href="/auth?mode=signup">Create one</Link></>
          )}
        </p>
      </div>
    </main>
  );
}
