-- Seed all 30 bookable spaces derived from the SVG floor plan.
-- Safe to run multiple times (ON CONFLICT DO NOTHING).

insert into spaces (id, label, type, zone_id, capacity, price_per_hour, x, y, width, height) values

-- Open Hot Desks — 4 cols × 4 rows (HD1–HD16)
('HD1',  'D1',  'desk', 'hot-desks', 1,  8, 30,  60,  95, 65),
('HD2',  'D2',  'desk', 'hot-desks', 1,  8, 145, 60,  95, 65),
('HD3',  'D3',  'desk', 'hot-desks', 1,  8, 260, 60,  95, 65),
('HD4',  'D4',  'desk', 'hot-desks', 1,  8, 375, 60,  95, 65),
('HD5',  'D5',  'desk', 'hot-desks', 1,  8, 30,  145, 95, 65),
('HD6',  'D6',  'desk', 'hot-desks', 1,  8, 145, 145, 95, 65),
('HD7',  'D7',  'desk', 'hot-desks', 1,  8, 260, 145, 95, 65),
('HD8',  'D8',  'desk', 'hot-desks', 1,  8, 375, 145, 95, 65),
('HD9',  'D9',  'desk', 'hot-desks', 1,  8, 30,  230, 95, 65),
('HD10', 'D10', 'desk', 'hot-desks', 1,  8, 145, 230, 95, 65),
('HD11', 'D11', 'desk', 'hot-desks', 1,  8, 260, 230, 95, 65),
('HD12', 'D12', 'desk', 'hot-desks', 1,  8, 375, 230, 95, 65),
('HD13', 'D13', 'desk', 'hot-desks', 1,  8, 30,  315, 95, 65),
('HD14', 'D14', 'desk', 'hot-desks', 1,  8, 145, 315, 95, 65),
('HD15', 'D15', 'desk', 'hot-desks', 1,  8, 260, 315, 95, 65),
('HD16', 'D16', 'desk', 'hot-desks', 1,  8, 375, 315, 95, 65),

-- Quiet Zone — 4 cols × 2 rows (QZ1–QZ8)
('QZ1', 'Q1', 'desk', 'quiet-zone', 1, 8, 30,  465, 95, 65),
('QZ2', 'Q2', 'desk', 'quiet-zone', 1, 8, 145, 465, 95, 65),
('QZ3', 'Q3', 'desk', 'quiet-zone', 1, 8, 260, 465, 95, 65),
('QZ4', 'Q4', 'desk', 'quiet-zone', 1, 8, 375, 465, 95, 65),
('QZ5', 'Q5', 'desk', 'quiet-zone', 1, 8, 30,  550, 95, 65),
('QZ6', 'Q6', 'desk', 'quiet-zone', 1, 8, 145, 550, 95, 65),
('QZ7', 'Q7', 'desk', 'quiet-zone', 1, 8, 260, 550, 95, 65),
('QZ8', 'Q8', 'desk', 'quiet-zone', 1, 8, 375, 550, 95, 65),

-- Private Offices — 3 stacked (PO1–PO3)
('PO1', 'Office 1', 'office', 'private-offices', 1, 20, 540, 50,  400, 85),
('PO2', 'Office 2', 'office', 'private-offices', 1, 20, 540, 160, 400, 85),
('PO3', 'Office 3', 'office', 'private-offices', 1, 20, 540, 270, 400, 85),

-- Meeting Rooms (MR1–MR2)
('MR1', 'Board Room', 'meeting-room', 'meeting-rooms', 6, 40, 535, 430, 185, 215),
('MR2', 'Focus Room', 'meeting-room', 'meeting-rooms', 4, 30, 745, 430, 185, 215)

on conflict (id) do nothing;
