import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { resend } from '@/lib/resend';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  if (!sig) return new Response('Missing stripe-signature header', { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err}`, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.booking_id;

  if (!bookingId) return new Response('ok', { status: 200 });

  if (event.type === 'checkout.session.completed') {
    const { data: booking } = await supabase
      .from('bookings')
      .update({
        status:             'confirmed',
        stripe_session_id:  session.id,
        payment_intent_id:  session.payment_intent as string,
      })
      .eq('id', bookingId)
      .select('customer_email, customer_name, booked_date, start_time, end_time, duration_hours, total_price, space_id, cancel_token')
      .single();

    if (booking) {
      const { data: space } = await supabase
        .from('spaces')
        .select('label')
        .eq('id', booking.space_id)
        .single();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const cancelUrl = `${appUrl}/booking/cancel?token=${booking.cancel_token}`;

      const dateStr = new Date(`${booking.booked_date}T${booking.start_time}`).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'FlowSpace <onboarding@resend.dev>',
        to: booking.customer_email,
        subject: 'Your booking is confirmed',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#0f172a">
            <h2 style="margin-bottom:4px">Booking Confirmed</h2>
            <p style="color:#64748b;margin-top:0">Hi ${booking.customer_name}, your payment was received.</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0">
              <tr><td style="padding:8px 0;color:#64748b;width:40%">Space</td><td style="padding:8px 0;font-weight:600">${space?.label ?? booking.space_id}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Date</td><td style="padding:8px 0;font-weight:600">${dateStr}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Time</td><td style="padding:8px 0;font-weight:600">${booking.start_time} – ${booking.end_time}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Duration</td><td style="padding:8px 0;font-weight:600">${booking.duration_hours} hour${booking.duration_hours > 1 ? 's' : ''}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Total paid</td><td style="padding:8px 0;font-weight:600">$${Number(booking.total_price).toFixed(2)}</td></tr>
            </table>
            <a href="${cancelUrl}" style="color:#64748b;font-size:13px">Need to cancel? Click here for a full refund.</a>
          </div>
        `,
      });
      console.log('[resend]', emailError ?? emailData);
    }
  }

  if (event.type === 'checkout.session.expired') {
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
  }

  return new Response('ok', { status: 200 });
}
