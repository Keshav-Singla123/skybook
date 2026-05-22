# SkyBook - Flight Management

SkyBook is a production-ready flight management web app built for a competitive internship assignment. It supports flight search, real-time seat selection, authenticated booking, cancellation, rescheduling, offline booking access, and PWA install support.

Live demo: add your Vercel production URL here after deployment.

## Tech Stack

- Next.js App Router: server components for data fetching and client components only where interactivity is needed.
- TypeScript strict mode: shared domain interfaces live in `types/index.ts`.
- Supabase: PostgreSQL, Auth, RLS, RPC functions, and Realtime seat updates.
- Zustand: two persisted stores, separated by booking flow state and user/offline booking state.
- Tailwind CSS: tokenized visual system in `app/globals.css`.
- next-pwa: production-only service worker, manifest, install prompt, and offline fallback.

## Local Setup

```bash
git clone <your-repo-url>
cd skybook
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/migrations/001_initial_schema.sql`.
3. Run `supabase/seed/seed.sql`.
4. In Supabase Dashboard, enable Realtime for the `seats` table.
5. Create a manual test user in Auth.

Suggested test credentials:

- Email: `demo@skybook.app`
- Password: `SkyBook@12345`

## Zustand Architecture

`useFlightStore` owns the booking journey: search query, recent searches, selected flight, selected seat, optimistic seat id, current step, and passenger form. It persists the booking flow so refreshes do not destroy progress.

`useUserStore` owns authenticated-user concerns: session, user, and cached bookings. Persisted data is intentionally narrow: only `session.access_token` and `cachedBookings`.

The passenger form persists name, nationality, and date of birth, but excludes `passport_no` through `partialize` because passport numbers are sensitive and should not sit in localStorage.

Optimistic seat selection stores `optimisticSeatId` immediately when a seat is clicked and again before `reserve_seat` runs. Supabase Realtime refreshes the map when another booking changes seat availability.

## Database Design

`reserve_seat` uses `SELECT ... FOR UPDATE` on the selected seat row. That row lock prevents two users from booking the same seat at the same time.

Cancellation rules are enforced twice. The `cancel_booking` RPC checks the two-hour departure window before changing status, and the `bookings_cancellation_window` trigger blocks direct table updates that try to bypass that rule.

RLS is enabled on every table. Flights and seats are publicly readable; bookings, passengers, and reschedules are scoped to `auth.uid()`.

## Known Trade-Offs

- Payments are represented as a confirmation step only; a real gateway such as Razorpay or Stripe would be next.
- Rescheduling keeps the same seat id for simplicity. A production airline flow would require selecting a seat on the new aircraft.
- The README includes a placeholder for the Lighthouse PWA screenshot and Vercel URL because those are generated after deployment.
- Seed data includes one flight per route direction; add more same-route flights to make rescheduling richer.

## Lighthouse PWA Screenshot

Add the Lighthouse PWA screenshot here after running the deployed Vercel app through Lighthouse.

## Submission Checklist

- `.env.example` included.
- Complete Supabase migration and seed SQL included.
- Flight search, booking, seat map, cancellation, rescheduling, Zustand stores, PWA manifest, offline page, and install prompt implemented.
- Deploy on Vercel and add the production URL before final submission.
