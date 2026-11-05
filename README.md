# Emergency Response

Cross-platform emergency response web app: one-tap SOS with live GPS, offline first-aid
guidance, emergency contacts, family check-in, community incident reporting, and a
responder console.

> **Safety notice:** this app supplements — never replaces — emergency services.
> In a life-threatening emergency, always call your local emergency number (112/911) first.

## Run locally

```bash
npm install
npm run dev     # development
# or
npm run build && npm start   # production
```

Open http://localhost:3000.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home, SOS entry point |
| `/sos` | Press-and-hold SOS, live GPS, siren, history |
| `/first-aid` | Searchable first-aid topics (offline-cached) |
| `/first-aid/[id]` | Step-by-step guide |
| `/incidents` | Report an incident + nearby incident feed |
| `/dashboard` | Responder triage queue + workplace roll-call |
| `/contacts` | Trusted emergency contacts (cloud or localStorage) |
| `/family` | Household check-in (cloud or localStorage) |
| `/login` | Sign in / create account |
| `/settings` | Privacy, stored data, offline/install info |
| `/offline` | Offline fallback page |

## Local data

Contacts, family members, and SOS history are stored in the browser's `localStorage`
only. Use **Settings → Delete all local data** to wipe them.

## Backend (Supabase)

The app works as a frontend demo without a backend — it falls back to `localStorage`
and demo data. To enable the full backend:

1. Create a Supabase project.
2. Apply `supabase/schema.sql` in the SQL editor (idempotent; safe to re-run). It creates
   profiles (with an auto-create trigger), emergency contacts, family check-ins, SOS
   events, incidents, organizations/memberships, RLS policies, and an
   `incidents_near(lat, lng, radius_m)` function.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project settings → API).
4. Restart the server. Pages show a "Synced to cloud" badge when the database is live.

### Auth

Email/password auth is wired through `@supabase/ssr`:

- `src/lib/supabase.ts` — browser client
- `src/lib/supabase-server.ts` — cookie-bound server client
- `src/proxy.ts` — Next.js 16 Proxy (middleware) that refreshes sessions
- `/login` — sign in / sign up, `/auth/callback` — email-confirmation exchange

Signed-in users get their contacts, family check-ins, incidents, and SOS events stored
in Postgres. Anonymous users keep local-only storage.

### Still required for production alerting

Push (FCM/APNs), SMS/voice fallback (Twilio), and an Edge Function to fan out SOS events
to emergency contacts.

## Testing

```bash
npm run smoke   # route smoke test against http://localhost:3000
```

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres +
PostGIS) · PWA manifest + service worker.
