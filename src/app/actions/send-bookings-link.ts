'use server';

import { createToken } from '@/lib/bookings-token';
import { resend } from '@/lib/resend';
import { redirect } from 'next/navigation';

export async function sendBookingsLink(formData: FormData): Promise<void> {
  const email = (formData.get('email') as string).trim().toLowerCase();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const link = `${appUrl}/bookings?token=${createToken(email)}`;

  await resend.emails.send({
    from: 'WorkSpace <onboarding@resend.dev>',
    to: email,
    subject: 'Your bookings link',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#0f172a">
        <h2 style="margin-bottom:4px">View Your Bookings</h2>
        <p style="color:#64748b">Click the link below to see your bookings. It expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">View My Bookings</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });

  redirect('/bookings?sent=1');
}
