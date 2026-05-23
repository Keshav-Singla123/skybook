# SkyBook

SkyBook is a flight booking experience built with Next.js, Supabase, and Zustand. It lets users search flights, select seats from a live map, book with passenger details, manage existing bookings, and recover key booking information offline.

## Highlights

- Flight search with route, date, passenger count, and class filters
- Real-time seat availability and concurrency-safe seat reservation
- Auth-protected booking, confirmation, reschedule, and my-bookings flows
- Offline-friendly booking summaries and a PWA install prompt
- Responsive UI with custom components and a lightweight design system

## Tech Stack

- Next.js App Router + TypeScript
- Supabase Auth, Postgres, RLS, RPC, and Realtime
- Zustand for client state and booking flow persistence
- Tailwind CSS for styling
- next-pwa for service worker support and offline caching

## Architecture Decisions

### App Router and route groups

The app uses the Next.js App Router with route groups to separate public auth pages from protected dashboard flows. That keeps the landing page, login/register pages, and booking surfaces organized without needing a separate frontend project.

### Supabase as the backend

Supabase handles authentication, persistence, and booking rules. The database layer owns the important invariants, including seat reservation and cancellation windows, so the client does not have to trust itself for critical checks.

### Server-side auth guard in middleware

Protected routes are checked in `middleware.ts` before they render. This keeps unauthorized users out of booking and account pages while still allowing Supabase session cookies to be read on the server.

### Zustand for local booking state

The booking flow is multi-step, so the app keeps transient UI state in Zustand instead of overloading React component state. Search inputs, the selected flight and seat, and the current step are persisted so navigation and refreshes do not lose progress.

### Partial persistence for sensitive data

Only non-sensitive booking state is persisted. Passport number is intentionally removed before storage, which reduces the risk of leaving personal data in localStorage while still preserving the rest of the flow.

### Client-side interaction with server RPCs

Critical booking actions call Supabase RPCs such as seat reservation and cancellation. That keeps concurrency-sensitive logic close to the database while still allowing the UI to optimistically reflect seat selection.

### PWA support

`next-pwa` is configured to register a service worker in production, cache app shell and booking pages, and improve resilience for offline reading. The install prompt is handled separately in the UI.

## Setup

### Prerequisites

- Node.js 18 or later
- A Supabase project
- The Supabase CLI or access to the Supabase SQL editor

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file in the project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

There is no committed `.env.example` file in this repository, so the environment file needs to be created manually.

### Set up the database

Run the SQL files in Supabase in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed/seed.sql`

After that, enable Realtime for the `seats` table in Supabase Database > Publications.

### Run the app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Useful Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run db:reset
```

`db:reset` is only a reminder command in this repository. Database resets were handled manually from the Supabase dashboard during development.

## Key Data Flows

- Search state lives in `useFlightStore`
- User/session and cached bookings live in `useUserStore`
- Flight, seat, booking, passenger, and reschedule records are modeled in `types/index.ts`
- Supabase client creation is centralized in `lib/supabase/client.ts`

The flight store uses persisted state for recent searches, selected flight, selected seat, and booking step. Passenger passport number is deliberately excluded from persistence.

## Trade-offs

- The booking flow is intentionally client-heavy for speed of development and a smoother UX, but that means some business rules still depend on RPCs and middleware rather than server actions.
- The state model is compact and easy to reason about, but it is not as decomposed as a larger production codebase would likely require.
- PWA caching improves offline reading, but the app still requires a network connection for most booking mutations.
- The demo data set is small and route coverage is limited, so the app is better suited to showing the workflow than simulating a full airline network.

## Known Gaps

- Seat map scrolling can feel rough on some mobile browsers, especially iOS Safari.
- Some reschedule scenarios are simplified, including cases where a price difference is zero.
- The install prompt is more reliable on mobile than on desktop Chrome.
- The Next.js middleware warning reflects the framework transition toward `proxy.ts`, but middleware is kept here to match the project structure and behavior.

## Project Structure

```text
app/            Routes, layouts, and pages
components/     UI, booking, flight, seat, and layout components
lib/            Shared utilities, stores, and Supabase clients
supabase/       SQL migrations and seed data
public/         Manifest and PWA assets
types/          Shared TypeScript types and database contracts
```

## Notes for Reviewers

This project was built to demonstrate a complete booking flow rather than to mirror every airline edge case. The most important design choice is that stateful, concurrency-sensitive operations are pushed into Supabase-backed server logic, while the client focuses on navigation, selection, and responsiveness.
