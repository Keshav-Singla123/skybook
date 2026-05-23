truncate table public.reschedules, public.passengers, public.bookings, public.seats, public.flights restart identity cascade;

with inserted_flights as (
  insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  values
    ('SB501', 'DEL', 'BOM', now()::date + 0 + interval '08 hours 00 minutes', now()::date + 0 + interval '10 hours 10 minutes', 'Airbus A320neo', 'scheduled', 6200),
    ('SB502', 'BOM', 'DEL', now()::date + 0 + interval '14 hours 30 minutes', now()::date + 0 + interval '16 hours 35 minutes', 'Boeing 737 MAX', 'scheduled', 6400),
    ('SB503', 'DEL', 'BLR', now()::date + 1 + interval '09 hours 20 minutes', now()::date + 1 + interval '12 hours 00 minutes', 'Airbus A321neo', 'boarding', 7800),
    ('SB504', 'BLR', 'DEL', now()::date + 1 + interval '18 hours 10 minutes', now()::date + 1 + interval '20 hours 55 minutes', 'Boeing 737', 'scheduled', 7550),
    ('SB505', 'DEL', 'HYD', now()::date + 2 + interval '07 hours 45 minutes', now()::date + 2 + interval '10 hours 05 minutes', 'Airbus A320neo', 'scheduled', 6900),
    ('SB506', 'HYD', 'DEL', now()::date + 2 + interval '16 hours 30 minutes', now()::date + 2 + interval '18 hours 50 minutes', 'Boeing 737', 'boarding', 7050),
    ('SB507', 'DEL', 'GOI', now()::date + 3 + interval '10 hours 15 minutes', now()::date + 3 + interval '12 hours 45 minutes', 'ATR 72', 'scheduled', 5300),
    ('SB508', 'GOI', 'DEL', now()::date + 3 + interval '19 hours 00 minutes', now()::date + 3 + interval '21 hours 30 minutes', 'ATR 72', 'scheduled', 5150),
    ('SB509', 'BOM', 'BLR', now()::date + 4 + interval '08 hours 25 minutes', now()::date + 4 + interval '10 hours 35 minutes', 'Airbus A320neo', 'scheduled', 5900),
    ('SB510', 'BLR', 'BOM', now()::date + 4 + interval '15 hours 40 minutes', now()::date + 4 + interval '17 hours 50 minutes', 'Airbus A320neo', 'scheduled', 6050),
    ('SB511', 'BOM', 'HYD', now()::date + 5 + interval '06 hours 55 minutes', now()::date + 5 + interval '08 hours 55 minutes', 'Boeing 737 MAX', 'scheduled', 5600),
    ('SB512', 'HYD', 'BOM', now()::date + 5 + interval '17 hours 25 minutes', now()::date + 5 + interval '19 hours 25 minutes', 'Boeing 737 MAX', 'delayed', 5750),
    ('SB513', 'BOM', 'GOI', now()::date + 6 + interval '09 hours 10 minutes', now()::date + 6 + interval '10 hours 45 minutes', 'ATR 72', 'scheduled', 4300),
    ('SB514', 'GOI', 'BOM', now()::date + 6 + interval '20 hours 20 minutes', now()::date + 6 + interval '21 hours 55 minutes', 'ATR 72', 'scheduled', 4100),
    ('SB515', 'BLR', 'HYD', now()::date + 7 + interval '11 hours 05 minutes', now()::date + 7 + interval '12 hours 50 minutes', 'Airbus A321neo', 'scheduled', 4700),
    ('SB516', 'HYD', 'BLR', now()::date + 7 + interval '18 hours 40 minutes', now()::date + 7 + interval '20 hours 25 minutes', 'Airbus A321neo', 'scheduled', 4850),
    ('SB517', 'BLR', 'GOI', now()::date + 8 + interval '07 hours 30 minutes', now()::date + 8 + interval '09 hours 25 minutes', 'ATR 72', 'scheduled', 4950),
    ('SB518', 'GOI', 'BLR', now()::date + 8 + interval '14 hours 45 minutes', now()::date + 8 + interval '16 hours 40 minutes', 'ATR 72', 'boarding', 5050),
    ('SB519', 'HYD', 'GOI', now()::date + 8 + interval '09 hours 00 minutes', now()::date + 8 + interval '10 hours 30 minutes', 'ATR 72', 'scheduled', 3900),
    ('SB520', 'GOI', 'HYD', now()::date + 8 + interval '16 hours 15 minutes', now()::date + 8 + interval '17 hours 45 minutes', 'ATR 72', 'scheduled', 4050)
  returning id
),
seat_rows as (
  select id as flight_id, row_no, seat_letter
  from inserted_flights
  cross join generate_series(1, 30) as row_no
  cross join lateral (
    select unnest(case when row_no <= 2 then array['A','C','D','F'] else array['A','B','C','D','E','F'] end) as seat_letter
  ) letters
)
insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select
  flight_id,
  row_no::text || seat_letter,
  case when row_no <= 2 then 'first' when row_no <= 7 then 'business' else 'economy' end,
  not (row_no >= 8 and ((row_no * ascii(seat_letter) + extract(day from now())::int) % 13 = 0)),
  case when row_no <= 2 then 8000 when row_no <= 7 then 3000 else 0 end
from seat_rows;
