'use server';

import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  return `${String(h + hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function createBooking(input: {
  spaceId: string;
  date: string;
  startTime: string;
  durationHours: number;
  totalPrice: number;
  customerEmail: string;
  customerName: string;
}): Promise<{ url: string } | { error: string }> {
  const { spaceId, date, startTime, durationHours, totalPrice, customerEmail, customerName } = input;
  const endTime = addHours(startTime, durationHours);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Check for overlapping confirmed bookings
  const { data: conflicts, error: checkError } = await supabase
    .from('bookings')
    .select('id')
    .eq('space_id', spaceId)
    .eq('booked_date', date)
    .eq('status', 'confirmed')
    .lt('start_time', endTime)
    .gt('end_time', startTime);

  if (checkError) return { error: checkError.message };
  if (conflicts && conflicts.length > 0) {
    return { error: 'This space is already booked for the selected time. Please choose a different slot.' };
  }

  // Insert booking as pending — confirmed by Stripe webhook after payment
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      space_id:       spaceId,
      booked_date:    date,
      start_time:     startTime,
      end_time:       endTime,
      duration_hours: durationHours,
      total_price:    totalPrice,
      status:         'pending',
      customer_email: customerEmail,
      customer_name:  customerName,
    })
    .select('id')
    .single();

  if (insertError || !booking) return { error: insertError?.message ?? 'Failed to create booking.' };

  // Fetch space label for the Stripe line item
  const { data: space } = await supabase
    .from('spaces')
    .select('label, zone_id')
    .eq('id', spaceId)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: space?.label ?? spaceId,
          description: `${date} · ${startTime}–${endTime} (${durationHours}h)`,
        },
        unit_amount: Math.round(totalPrice * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${appUrl}`,
    metadata: { booking_id: booking.id },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30-min window to pay
  });

  return { url: session.url! };
}
