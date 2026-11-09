# TRABUC web

A travel companion web app: discover destinations, sketch trips, browse camping and stays, use travel
tools, read stories, and keep memories. **This is phase 1: a navigable UI with sample content plus a
Supabase Auth foundation.**

## Quick start

```bash
npm install
cp .env.example .env   # then fill in the two Supabase values (optional for browsing)
npm run dev
```

Other commands: `npm run build`, `npm run preview`, `npm run lint`, `npm run typecheck`, `npm test`.

## Supabase setup (needed for accounts)

The public pages work without it. Sign-in, sign-up and the account area need a Supabase project.

1. Create a project at supabase.com.
2. Project Settings > API: copy the **Project URL** and the **anon / publishable key** into `.env`:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Only these public values belong in the frontend.
   Never use the service-role key here, and never commit `.env`.
3. Authentication > URL Configuration: set **Site URL** to your app URL (for example
   `http://localhost:5173`) and add `http://localhost:5173/reset-password` to **Redirect URLs**.
4. Authentication > Providers > Email: enabled by default. If "Confirm email" is on, new users must open
   the emailed link before signing in (the app shows a "Check your email" screen).
5. Restart `npm run dev` after editing `.env`.

Without these values the app stays runnable and shows an "Authentication is not configured" notice.

> Live authentication has **not** been tested against a real Supabase project in this repository's
> build. Test sign-up, sign-in, sign-out, session restore and password reset once you connect yours.

## What is real and what is preview

| Area | Status |
| --- | --- |
| Navigation, menus, destination search and filters | Working, against sample data |
| Destinations, stories, experiences | Sample content (labelled in the UI) |
| Trip planner | Working in local state only. Lost on refresh. Not saved anywhere |
| AI itineraries | Coming soon (button and copy only) |
| Bookings and payments | Preview only. Nothing can be booked or paid for |
| Language and currency tools | Preview only. No translations or exchange rates are shown |
| Story publishing, memories, uploads | Coming soon |
| Contact form | Disabled. It is not connected to an inbox |
| Email/password auth, session persistence, protected routes, password reset | Implemented with Supabase Auth. Needs your credentials |
| Social login | Not included |

## Structure

```
src/
  components/   shared UI (Media with image fallback, Dialog, Field, notices)
  layouts/      PublicLayout, AccountLayout
  features/
    auth/ destinations/ trips/ bookings/ tools/ stories/ site/
  lib/supabase.ts   client + env validation
  styles/       tokens.css (theme), base.css, components.css
```

## Design and theming

The brand is undecided, so the theme is a temporary neutral one. All colours, fonts, spacing, radii and
shadows are CSS variables in `src/styles/tokens.css`, including a dark scheme. "TRABUC" is a text
wordmark in `src/layouts/PublicLayout.tsx`. Plain CSS was used instead of Tailwind to keep dependencies small.

Imagery: no photos are hotlinked because licences cannot be verified. Each destination falls back to
generated contour artwork. To use photos, set `image` and `imageCredit` on an item in
`src/features/destinations/data.ts`; broken URLs fall back automatically.

## Accessibility

Semantic landmarks, skip link, visible focus, 44px touch targets, native `<dialog>` for modals,
labelled form fields with error text, and `prefers-reduced-motion` support.

## Known limitations

- Trips, filters and sample content are not persisted.
- No end-to-end test against live Supabase. Unit and component tests cover filtering, validation,
  trip helpers and the protected route.
- Dates are shown in a fixed `en-GB` format and sample prices are USD.
- Single JS bundle (about 100 kB gzipped); route-level code splitting is a later improvement.

## Suggested next phase

1. Persist trips and memories in Supabase with per-user Row Level Security and migrations.
2. Real destination content and licensed imagery.
3. Booking provider and payments, then translation and currency services.
4. Profile editing, story publishing and uploads.
