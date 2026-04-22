'use client';

import { useActionState, useEffect } from 'react';
import { createBooking } from '@/app/actions/book';
import styles from './BookingPanel.module.css';
import type { Space } from './FloorPlan';

interface Props {
  space: Space;
  selectedDate: string;
  selectedTime: string;
  selectedDuration: number;
  onCancel: () => void;
}

type ActionState = { ok: false; error: string } | { ok: true; url: string } | null;

const ZONE_LABELS: Record<string, string> = {
  'hot-desks':       'Open Hot Desks',
  'quiet-zone':      'Quiet Zone',
  'private-offices': 'Private Offices',
  'meeting-rooms':   'Meeting Rooms',
};

function formatSlot(date: string, time: string, duration: number): string {
  const d = new Date(`${date}T${time}`);
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${dateStr} · ${timeStr} · ${duration} hour${duration > 1 ? 's' : ''}`;
}

export default function BookingPanel({ space, selectedDate, selectedTime, selectedDuration, onCancel }: Props) {
  const total = space.pricePerHour * selectedDuration;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prev, formData) => {
      const result = await createBooking({
        spaceId:       space.id,
        date:          selectedDate,
        startTime:     selectedTime,
        durationHours: selectedDuration,
        totalPrice:    total,
        customerEmail: formData.get('email') as string,
        customerName:  formData.get('name') as string,
      });
      if ('error' in result) return { ok: false, error: result.error };
      return { ok: true, url: result.url };
    },
    null,
  );

  useEffect(() => {
    if (state?.ok) window.location.href = state.url;
  }, [state]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{space.label}</h2>
          <p className={styles.subtitle}>{ZONE_LABELS[space.zoneId]} · {space.capacity} {space.capacity === 1 ? 'person' : 'people'}</p>
        </div>
        <button className={styles.closeBtn} onClick={onCancel} aria-label="Cancel selection">×</button>
      </div>

      <div className={styles.slotSummary}>
        {formatSlot(selectedDate, selectedTime, selectedDuration)}
      </div>

      <form action={formAction} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="bp-name">Name</label>
            <input id="bp-name" name="name" type="text" placeholder="Your name" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="bp-email">Email</label>
            <input id="bp-email" name="email" type="email" placeholder="you@example.com" required />
          </div>
        </div>

        {state && !state.ok && <p className={styles.error}>{state.error}</p>}

        <div className={styles.total}>
          <span>Total</span>
          <span className={styles.price}>${total.toFixed(2)}</span>
        </div>

        <button type="submit" className={styles.bookBtn} disabled={isPending}>
          {isPending ? 'Booking…' : 'Book Now'}
        </button>
      </form>
    </div>
  );
}
