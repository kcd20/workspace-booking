'use server';

import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

export async function cancelBooking(token: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, status, payment_intent_id')
    .eq('cancel_token', token)
    .single();

  if (error || !booking) {
    redirect(`/booking/cancel?token=${token}&err=not_found`);
  }

  if (booking.status !== 'confirmed') {
    redirect(`/booking/cancel?token=${token}&err=ineligible`);
  }

  if (!booking.payment_intent_id) {
    redirect(`/booking/cancel?token=${token}&err=no_payment`);
  }

  await stripe.refunds.create({ payment_intent: booking.payment_intent_id });

  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking.id);

  redirect('/booking/cancel/confirmed');
}
