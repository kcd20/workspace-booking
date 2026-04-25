'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './FloorPlan.module.css';
import BookingPanel from './BookingPanel';

type Status = 'available' | 'booked' | 'selected';

export interface Space {
  id: string;
  label: string;
  type: 'desk' | 'office' | 'meeting-room';
  zoneId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  status: Status;
  pricePerHour: number;
}

type SpaceLayout = Omit<Space, 'status'>;

type SelectedSlot = { id: string; date: string; time: string; duration: number };

const ZONES = [
  { id: 'hot-desks',        label: 'Open Hot Desks',  x: 10,  y: 10,  w: 490, h: 395, bg: '#fffbeb', border: '#d97706' },
  { id: 'quiet-zone',       label: 'Quiet Zone',       x: 10,  y: 420, w: 490, h: 250, bg: '#f5f3ff', border: '#7c3aed' },
  { id: 'private-offices',  label: 'Private Offices',  x: 520, y: 10,  w: 450, h: 360, bg: '#eff6ff', border: '#1d4ed8' },
  { id: 'meeting-rooms',    label: 'Meeting Rooms',    x: 520, y: 385, w: 450, h: 285, bg: '#f0fdf4', border: '#15803d' },
] as const;

const STATUS_FILL: Record<Status, { base: string; hover: string; text: string }> = {
  available: { base: '#22c55e', hover: '#16a34a', text: '#fff' },
  booked:    { base: '#ef4444', hover: '#ef4444', text: '#fff' },
  selected:  { base: '#3b82f6', hover: '#2563eb', text: '#fff' },
};

const DURATIONS = [1, 2, 3, 4, 8];

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  return `${String(h + hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getMeetingRoomChairs(cx: number, cy: number, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    return { key: i, cx: cx + Math.cos(angle) * 68, cy: cy + Math.sin(angle) * 44 };
  });
}

function buildLayoutSpaces(): SpaceLayout[] {
  const spaces: SpaceLayout[] = [];
  const hdCols = [30, 145, 260, 375];

  let d = 1;
  for (const y of [60, 145, 230, 315]) {
    for (const x of hdCols) {
      spaces.push({ id: `HD${d}`, label: `D${d}`, type: 'desk', zoneId: 'hot-desks', x, y, width: 95, height: 65, capacity: 1, pricePerHour: 8 });
      d++;
    }
  }

  let q = 1;
  for (const y of [465, 550]) {
    for (const x of hdCols) {
      spaces.push({ id: `QZ${q}`, label: `Q${q}`, type: 'desk', zoneId: 'quiet-zone', x, y, width: 95, height: 65, capacity: 1, pricePerHour: 8 });
      q++;
    }
  }

  for (const [i, y] of ([50, 160, 270] as const).entries()) {
    spaces.push({ id: `PO${i + 1}`, label: `Office ${i + 1}`, type: 'office', zoneId: 'private-offices', x: 540, y, width: 400, height: 85, capacity: 1, pricePerHour: 20 });
  }

  spaces.push({ id: 'MR1', label: 'Board Room', type: 'meeting-room', zoneId: 'meeting-rooms', x: 535, y: 430, width: 185, height: 215, capacity: 6, pricePerHour: 40 });
  spaces.push({ id: 'MR2', label: 'Focus Room', type: 'meeting-room', zoneId: 'meeting-rooms', x: 745, y: 430, width: 185, height: 215, capacity: 4, pricePerHour: 30 });

  return spaces;
}

const LAYOUT_SPACES = buildLayoutSpaces();
const todayISO = () => new Date().toISOString().split('T')[0];

async function fetchBookedIds(date: string, startTime: string, endTime: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('bookings')
    .select('space_id')
    .eq('booked_date', date)
    .eq('status', 'confirmed')
    .lt('start_time', endTime)
    .gt('end_time', startTime);
  return new Set((data ?? []).map((b: { space_id: string }) => b.space_id));
}

export default function FloorPlan() {
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());
  const [loadedSlot, setLoadedSlot] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const endTime = addHours(selectedTime, selectedDuration);
  const slotKey = `${selectedDate}|${selectedTime}|${selectedDuration}`;
  const loading = loadedSlot !== slotKey;

  // selectedId is only valid when the slot picker matches what was clicked
  const selectedId =
    selectedSlot?.date === selectedDate &&
    selectedSlot?.time === selectedTime &&
    selectedSlot?.duration === selectedDuration
      ? selectedSlot.id
      : null;

  // Fetch availability for the current slot (date + time range)
  useEffect(() => {
    let cancelled = false;
    const key = slotKey;
    const end = endTime;
    fetchBookedIds(selectedDate, selectedTime, end).then(ids => {
      if (!cancelled) { setBookedIds(ids); setLoadedSlot(key); }
    });
    return () => { cancelled = true; };
  }, [slotKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime: re-fetch on any booking change for this date
  useEffect(() => {
    const end = endTime;
    const channel = supabase
      .channel(`bookings:${slotKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `booked_date=eq.${selectedDate}` },
        () => fetchBookedIds(selectedDate, selectedTime, end).then(setBookedIds))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [slotKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const spaces: Space[] = LAYOUT_SPACES.map(s => ({
    ...s,
    status: selectedId === s.id ? 'selected'
          : bookedIds.has(s.id)  ? 'booked'
          : 'available',
  }));

  const selectedSpace = selectedId ? spaces.find(s => s.id === selectedId) ?? null : null;

  function handleClick(spaceId: string) {
    if (bookedIds.has(spaceId)) return;
    setSelectedSlot(prev =>
      prev?.id === spaceId && prev?.date === selectedDate && prev?.time === selectedTime && prev?.duration === selectedDuration
        ? null
        : { id: spaceId, date: selectedDate, time: selectedTime, duration: selectedDuration }
    );
  }

  return (
    <div className={styles.container}>
      {/* Slot picker */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlsLabel}>Date</label>
          <input type="date" value={selectedDate} min={todayISO()} onChange={e => setSelectedDate(e.target.value)} className={styles.slotInput} />
        </div>
        <div className={styles.controlGroup}>
          <label className={styles.controlsLabel}>Start time</label>
          <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className={styles.slotInput} />
        </div>
        <div className={styles.controlGroup}>
          <label className={styles.controlsLabel}>Duration</label>
          <select value={selectedDuration} onChange={e => setSelectedDuration(Number(e.target.value))} className={styles.slotInput}>
            {DURATIONS.map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        {loading && <span className={styles.loadingBadge}>Loading…</span>}
      </div>

      {/* SVG floor plan */}
      <div className={styles.svgWrapper} style={{ opacity: loading ? 0.55 : 1, transition: 'opacity 0.2s' }}>
        <svg viewBox="0 0 980 680" xmlns="http://www.w3.org/2000/svg" aria-label="WorkSpace floor plan" className={styles.svg}>

          {ZONES.map(zone => (
            <g key={zone.id}>
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={12} fill={zone.bg} stroke={zone.border} strokeWidth={1.5} />
              <text x={zone.x + zone.w / 2} y={zone.y + 27} textAnchor="middle" fontSize={12} fontWeight={700} fill={zone.border} fontFamily="var(--font-geist-sans), Arial, sans-serif" letterSpacing="0.5">
                {zone.label.toUpperCase()}
              </text>
            </g>
          ))}

          {spaces.map(space => {
            const colors = STATUS_FILL[space.status];
            const isHovered = hoveredId === space.id;
            const fill = isHovered && space.status !== 'booked' ? colors.hover : colors.base;
            const isMeetingRoom = space.type === 'meeting-room';
            const tableCx = space.x + space.width / 2;
            const tableCy = space.y + space.height / 2 + 18;
            const chairs = isMeetingRoom ? getMeetingRoomChairs(tableCx, tableCy, space.capacity) : [];

            return (
              <g
                key={space.id}
                onClick={space.status !== 'booked' ? () => handleClick(space.id) : undefined}
                onMouseEnter={() => setHoveredId(space.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: space.status === 'booked' ? 'not-allowed' : 'pointer' }}
                role="button"
                aria-label={`${space.label}, ${space.status}`}
                tabIndex={space.status !== 'booked' ? 0 : undefined}
                onKeyDown={space.status !== 'booked' ? e => { if (e.key === 'Enter' || e.key === ' ') handleClick(space.id); } : undefined}
              >
                <rect x={space.x} y={space.y} width={space.width} height={space.height} rx={8} fill={fill} stroke="rgba(0,0,0,0.12)" strokeWidth={1} style={{ transition: 'fill 0.15s ease' }} />

                {isMeetingRoom && (
                  <>
                    {chairs.map(c => <circle key={c.key} cx={c.cx} cy={c.cy} r={7} fill="rgba(255,255,255,0.35)" />)}
                    <ellipse cx={tableCx} cy={tableCy} rx={52} ry={28} fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
                  </>
                )}

                <text x={space.x + space.width / 2} y={isMeetingRoom ? space.y + 25 : space.y + space.height / 2 - (space.type === 'office' ? 5 : 4)} textAnchor="middle" fontSize={space.type === 'desk' ? 11 : 13} fontWeight={600} fill={colors.text} fontFamily="var(--font-geist-sans), Arial, sans-serif">
                  {space.label}
                </text>

                <text x={space.x + space.width / 2} y={isMeetingRoom ? space.y + 40 : space.type === 'office' ? space.y + space.height / 2 + 13 : space.y + space.height / 2 + 12} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.8)" fontFamily="var(--font-geist-sans), Arial, sans-serif">
                  {isMeetingRoom ? `${space.capacity} people · $${space.pricePerHour}/hr` : `$${space.pricePerHour}/hr`}
                </text>

                {isMeetingRoom && space.status === 'booked' && (
                  <text x={tableCx} y={tableCy + 5} textAnchor="middle" fontSize={11} fontWeight={600} fill="rgba(255,255,255,0.9)" fontFamily="var(--font-geist-sans), Arial, sans-serif">Booked</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {(['available', 'booked', 'selected'] as Status[]).map(status => (
          <div key={status} className={styles.legendItem}>
            <span className={styles.dot} style={{ background: STATUS_FILL[status].base }} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        ))}
      </div>

      {selectedSpace && (
        <BookingPanel
          space={selectedSpace}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedDuration={selectedDuration}
          onCancel={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}
