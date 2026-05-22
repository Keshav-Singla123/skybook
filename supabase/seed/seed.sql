truncate table public.reschedules, public.passengers, public.bookings, public.seats, public.flights restart identity cascade;

with inserted_flights as (
  insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  values
    ('SB101','DEL','BOM', now() + interval '2 days' + interval '08 hours', now() + interval '2 days' + interval '10 hours 10 minutes', 'Airbus A320neo', 'scheduled', 6200),
    ('SB102','BOM','DEL', now() + interval '2 days' + interval '14 hours', now() + interval '2 days' + interval '16 hours 05 minutes', 'Boeing 737 MAX', 'scheduled', 6400),
    ('SB203','DEL','BLR', now() + interval '3 days' + interval '09 hours 30 minutes', now() + interval '3 days' + interval '12 hours 10 minutes', 'Airbus A321neo', 'boarding', 7800),
    ('SB204','BLR','DEL', now() + interval '4 days' + interval '18 hours', now() + interval '4 days' + interval '20 hours 45 minutes', 'Boeing 737', 'scheduled', 7550),
    ('SB305','BOM','GOI', now() + interval '5 days' + interval '07 hours 45 minutes', now() + interval '5 days' + interval '09 hours', 'ATR 72', 'scheduled', 4300),
    ('SB306','GOI','BOM', now() + interval '5 days' + interval '20 hours 15 minutes', now() + interval '5 days' + interval '21 hours 30 minutes', 'ATR 72', 'delayed', 4100),
    ('SB407','DEL','HYD', now() + interval '6 days' + interval '10 hours', now() + interval '6 days' + interval '12 hours 20 minutes', 'Airbus A320neo', 'scheduled', 6900),
    ('SB408','HYD','DEL', now() + interval '7 days' + interval '16 hours 30 minutes', now() + interval '7 days' + interval '18 hours 50 minutes', 'Boeing 737', 'scheduled', 7050)
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
