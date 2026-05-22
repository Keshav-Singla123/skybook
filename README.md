# SkyBook

Flight booking app built with Next.js, Supabase and Zustand.

Live demo: add Vercel link here after deployment.

## What it does

SkyBook lets a user search flights, pick a seat from a live seat map, book with passenger details, see their PNR, cancel a booking, and reschedule to another flight on the same route.

The seat map was the trickiest part. Spent way too long on the realtime sync - turns out you need to re-subscribe when the flight changes and clean up the channel properly when leaving the page.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, RLS, RPC and Realtime
- Zustand with persist middleware
- next-pwa for offline page / install prompt

I also added `react-hot-toast` while trying notification options, but the app currently uses the small custom toast component in `components/ui/Toast.tsx`.

## Local setup

You'll need a Supabase project. Create one at supabase.com, free tier works fine.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Put these in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then open:

```text
http://localhost:3000
```

## Database setup

In Supabase SQL Editor:

1. Run `supabase/migrations/001_initial_schema.sql`
2. Run `supabase/seed/seed.sql`
3. Enable realtime for the `seats` table from Database > Publications
4. Create a user manually from Authentication > Users

Test user I used:

```text
demo@skybook.app
SkyBook@12345
```

Seeded flights are relative to `now()`, so search 2-7 days ahead after running the seed.

## Store notes

There are two Zustand stores:

- `useFlightStore`: search query, selected flight/seat, passenger form, current booking step
- `useUserStore`: user/session info and cached bookings for offline reading

Passport number is deliberately removed from persisted state. I missed this at first, then moved it into the `partialize` config because saving passport numbers to localStorage is not a good idea.

Optimistic seat selection uses `optimisticSeatId` so the UI reacts immediately. The actual booking still goes through `reserve_seat`, which locks the row in Postgres.

## Database notes

`reserve_seat` uses `SELECT ... FOR UPDATE` so two users cannot book the same seat at once.

Cancellation is checked in two places:

- `cancel_booking` RPC
- database trigger on `bookings`

That way even a direct update cannot cancel inside the 2-hour window.

## Known issues / rough edges

- The seat map scroll on iOS Safari is a bit janky - ran out of time to fix.
- Reschedule doesn't handle same-price flights perfectly, shows ₹0 fee which is correct but looks weird.
- PWA install prompt doesn't show on desktop Chrome, only mobile.
- Seed data only has one flight for some route directions, so reschedule needs an extra same-route flight for a better demo.
- The middleware warning appears on Next 16 because `middleware.ts` is moving toward `proxy.ts`, but the assignment asked for middleware.

## What I'd do differently

- Would add server actions instead of client-side RPC calls for better security.
- The Zustand store grew bigger than I expected - would split into smaller slices.
- Should add proper page-level error boundaries instead of relying on a shared global one.
- Would make rescheduling choose a new seat too, because real flights have different seat maps.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
npm run db:reset
```

`db:reset` only prints a reminder. I reset from the Supabase dashboard during development.
