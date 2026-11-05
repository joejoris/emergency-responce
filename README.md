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
| `/contacts` | Trusted emergency contacts (localStorage) |
| `/family` | Household check-in (localStorage) |
| `/settings` | Privacy, stored data, offline/install info |
| `/offline` | Offline fallback page |

## Local data

Contacts, family members, and SOS history are stored in the browser's `localStorage`
only. Use **Settings → Delete all local data** to wipe them.

## Backend (Supabase)

The app works as a frontend demo without a backend. To enable real persistence and
multi-device alerting:

1. Create a Supabase project.
2. Apply `supabase/schema.sql` (SQL editor or `supabase db push`).
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. `src/lib/supabase.ts` exposes a ready client; the schema includes RLS policies for
   profiles, contacts, organizations, SOS events (with PostGIS geolocation), and
   incidents plus an `incidents_near(lat, lng, radius_m)` helper.

Still required for production alerting: push (FCM/APNs), SMS/voice fallback (Twilio),
and an edge function to fan out SOS events to emergency contacts.

## Testing

```bash
npm run smoke   # route smoke test against http://localhost:3000
```

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres +
PostGIS) · PWA manifest + service worker.
