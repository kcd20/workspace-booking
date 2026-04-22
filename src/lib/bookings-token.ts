import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.MY_BOOKINGS_SECRET!;
const TTL_MS = 60 * 60 * 1000; // 1 hour

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createToken(email: string): string {
  const payload = Buffer.from(`${email}|${Date.now() + TTL_MS}`).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): string | null {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expected = Buffer.from(sign(payload));
  const actual   = Buffer.from(sig);
  if (expected.length !== actual.length) return null;
  if (!timingSafeEqual(expected, actual)) return null;

  const [email, exp] = Buffer.from(payload, 'base64url').toString().split('|');
  if (!email || !exp || Date.now() > Number(exp)) return null;

  return email;
}
