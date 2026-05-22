create extension if not exists "uuid-ossp";

create table if not exists public.flights (
  id uuid primary key default uuid_generate_v4(),
  flight_no text not null unique,
  origin text not null,
  destination text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz not null,
  aircraft_type text not null default 'Boeing 737',
  status text check (status in ('scheduled','delayed','boarding','departed','landed','cancelled')) default 'scheduled',
  base_price numeric(10,2) not null
);

create table if not exists public.seats (
  id uuid primary key default uuid_generate_v4(),
  flight_id uuid not null references public.flights(id) on delete cascade,
  seat_number text not null,
  class text check (class in ('economy','business','first')) not null,
  is_available boolean default true,
  extra_fee numeric(10,2) default 0,
  unique(flight_id, seat_number)
);

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flight_id uuid not null references public.flights(id),
  seat_id uuid not null references public.seats(id),
  status text check (status in ('confirmed','rescheduled','cancelled')) default 'confirmed',
  booked_at timestamptz default now(),
  total_price numeric(10,2) not null,
  pnr_code text not null unique default upper(substring(md5(random()::text),1,8))
);

create table if not exists public.passengers (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  passport_no text not null,
  nationality text not null,
  dob date not null
);

create table if not exists public.reschedules (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_flight_id uuid not null references public.flights(id),
  new_flight_id uuid not null references public.flights(id),
  requested_at timestamptz default now(),
  fee_charged numeric(10,2) default 0
);

alter table public.flights enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.reschedules enable row level security;

drop policy if exists "Flights are public" on public.flights;
create policy "Flights are public" on public.flights for select using (true);

drop policy if exists "Seats are public" on public.seats;
create policy "Seats are public" on public.seats for select using (true);

drop policy if exists "Users can read own bookings" on public.bookings;
create policy "Users can read own bookings" on public.bookings for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own bookings" on public.bookings;
create policy "Users can insert own bookings" on public.bookings for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own bookings" on public.bookings;
create policy "Users can update own bookings" on public.bookings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can read passengers for own bookings" on public.passengers;
create policy "Users can read passengers for own bookings" on public.passengers
for select using (booking_id in (select id from public.bookings where user_id = auth.uid()));

drop policy if exists "Users can insert passengers for own bookings" on public.passengers;
create policy "Users can insert passengers for own bookings" on public.passengers
for insert with check (booking_id in (select id from public.bookings where user_id = auth.uid()));

drop policy if exists "Users can read own reschedules" on public.reschedules;
create policy "Users can read own reschedules" on public.reschedules
for select using (booking_id in (select id from public.bookings where user_id = auth.uid()));

drop policy if exists "Users can insert own reschedules" on public.reschedules;
create policy "Users can insert own reschedules" on public.reschedules
for insert with check (booking_id in (select id from public.bookings where user_id = auth.uid()));

create or replace function public.reserve_seat(
  p_flight_id uuid,
  p_seat_id uuid,
  p_user_id uuid,
  p_total_price numeric,
  p_pnr_code text,
  p_full_name text,
  p_passport_no text,
  p_nationality text,
  p_dob date
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seat public.seats%rowtype;
  v_booking public.bookings%rowtype;
begin
  select * into v_seat
  from public.seats
  where id = p_seat_id and flight_id = p_flight_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Seat not found');
  end if;

  if v_seat.is_available = false then
    return jsonb_build_object('success', false, 'error', 'Seat no longer available');
  end if;

  update public.seats set is_available = false where id = p_seat_id;

  insert into public.bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  values (p_user_id, p_flight_id, p_seat_id, p_total_price, upper(p_pnr_code))
  returning * into v_booking;

  insert into public.passengers (booking_id, full_name, passport_no, nationality, dob)
  values (v_booking.id, p_full_name, p_passport_no, p_nationality, p_dob);

  return jsonb_build_object('success', true, 'booking_id', v_booking.id, 'pnr_code', v_booking.pnr_code);
exception
  when unique_violation then
    return jsonb_build_object('success', false, 'error', 'Booking reference collision. Please try again.');
  when others then
    return jsonb_build_object('success', false, 'error', sqlerrm);
end;
$$;

create or replace function public.cancel_booking(
  p_booking_id uuid,
  p_user_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_flight public.flights%rowtype;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking_id and user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Not found');
  end if;

  if v_booking.status = 'cancelled' then
    return jsonb_build_object('success', false, 'error', 'Already cancelled');
  end if;

  select * into v_flight from public.flights where id = v_booking.flight_id;

  if v_flight.departs_at - now() < interval '2 hours' then
    return jsonb_build_object('success', false, 'error', 'Cannot cancel within 2 hours of departure');
  end if;

  update public.bookings set status = 'cancelled' where id = p_booking_id;
  update public.seats set is_available = true where id = v_booking.seat_id;

  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.enforce_cancellation_window()
returns trigger
language plpgsql
as $$
declare
  v_departs_at timestamptz;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    select departs_at into v_departs_at from public.flights where id = old.flight_id;
    if v_departs_at - now() < interval '2 hours' then
      raise exception 'Cannot cancel within 2 hours of departure';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_cancellation_window on public.bookings;
create trigger bookings_cancellation_window
before update on public.bookings
for each row execute function public.enforce_cancellation_window();

create index if not exists flights_route_departure_idx on public.flights(origin, destination, departs_at);
create index if not exists seats_flight_class_idx on public.seats(flight_id, class, is_available);
create index if not exists bookings_user_idx on public.bookings(user_id, booked_at desc);
