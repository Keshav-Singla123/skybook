truncate table public.reschedules, public.passengers, public.bookings, public.seats, public.flights restart identity cascade;

with inserted_flights as (
  with station_list as (
    select * from (values
      ('DEL', 'Delhi', 0),
      ('BOM', 'Mumbai', 1),
      ('BLR', 'Bangalore', 2),
      ('HYD', 'Hyderabad', 3),
      ('GOI', 'Goa', 4)
    ) as stations(code, name, station_order)
  ),
  route_pairs as (
    select
      origin.code as origin,
      destination.code as destination,
      origin.station_order as origin_order,
      destination.station_order as destination_order,
      row_number() over (order by origin.station_order, destination.station_order) as route_rank
    from station_list origin
    cross join station_list destination
    where origin.code <> destination.code
  ),
  day_offsets as (
    select generate_series(0, 8) as day_offset
  ),
  scheduled_flights as (
    select
      'SB' || lpad((500 + day_offset * 20 + route_rank)::text, 3, '0') as flight_no,
      origin,
      destination,
      (date '2026-05-23' + day_offset) + make_interval(hours => 6 + ((route_rank - 1) % 9), mins => ((route_rank - 1) * 10) % 60) as departs_at,
      (date '2026-05-23' + day_offset) + make_interval(hours => 8 + ((route_rank - 1) % 9), mins => ((route_rank - 1) * 10) % 60 + 20 + ((route_rank - 1) % 3) * 5) as arrives_at,
      case when (route_rank % 3) = 0 then 'Airbus A321neo' when (route_rank % 3) = 1 then 'Airbus A320neo' else 'Boeing 737 MAX' end as aircraft_type,
      case when ((day_offset + route_rank) % 11) = 0 then 'boarding' when ((day_offset + route_rank) % 13) = 0 then 'delayed' else 'scheduled' end as status,
      3800 + (route_rank * 190) + (day_offset * 85) + case when origin in ('DEL', 'BOM') then 700 else 0 end as base_price
    from route_pairs
    cross join day_offsets
  )
  insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  select flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price
  from scheduled_flights
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
