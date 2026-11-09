# TRABUC web

A travel companion web app: discover destinations, sketch trips, browse camping and stays, use travel
tools, read stories, and keep memories. **Phase 2: a navigable UI with sample content, Supabase Auth and a `profiles` table.**

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
5. **Create the profiles table.** Open SQL Editor > New query, paste the whole contents of
   `supabase/migrations/20261109000000_profiles.sql`, and click Run. It creates `public.profiles`
   (`id` references `auth.users`, `full_name`, `created_at`), turns on Row Level Security so users can only
   read and update their own row, adds a trigger that creates a profile on sign up, and backfills
   existing users. Alternative with the CLI: `npx supabase login`, `npx supabase link --project-ref <ref>`,
   then `npx supabase db push`.
6. **Create the trips table.** In a new SQL query, paste the whole contents of
   `supabase/migrations/20261109010000_trips.sql` and Run it (run the profiles migration first; order is
   by filename). It creates `public.trips` with Row Level Security: only signed-in users can read, create,
   update and delete their own rows, and `anon` has no access. `user_id` is filled in by the database from
   the session, so the app never sends it. With the CLI, `npx supabase db push` applies both migrations.
7. **Create the destinations table and load the sample rows.** Run these two files in the SQL Editor, in
   this order: first `supabase/migrations/20261110000000_destinations.sql` (creates `public.destinations`
   with RLS: anyone, signed in or not, can read; nobody can insert, update or delete through the API), then
   `supabase/seed/destinations.sql` (inserts the 12 sample rows, all `verified = false`, and is safe to
   re-run: it never overwrites `image_*` or `verified`). Edit or add destinations afterwards in
   Table Editor > destinations. Set `verified = true` on a row once you have checked it, and the
   "Sample data" badge disappears for that row.
8. **Create memories and the photo bucket.** Run `supabase/migrations/20261111000000_memories.sql` in the SQL
   Editor (after the trips migration, because a memory can link to a trip). It creates `public.memories`
   with RLS (signed-in users only, own rows only, `user_id` set by the database, a linked trip must be
   yours) and, in the same file, the **private** storage bucket `memory-photos` (JPEG, PNG or WebP, 5 MB
   max) with storage policies that only allow each user to read, upload, replace and delete files under
   their own `{user id}/` folder. No service-role key is needed.
   **Check the bucket:** Storage > Buckets > `memory-photos` should show as **Private** (no "Public"
   label) with a 5 MB limit and the three image types. If it is missing or public, re-run the migration's
   `insert into storage.buckets ...` statement; do not make the bucket public.
9. Restart `npm run dev` after editing `.env`.
10. Check it: sign up with a name, confirm the email if required, sign in, and open **Account**. The name
   comes from the `profiles` table (Table Editor > profiles shows the new row). If the table is missing or
   the query fails, the page falls back to the name saved at sign-up. Then create, edit and delete a trip
   under **My trips**, refresh, and confirm it persists (Table Editor > trips). A second account must not see it.
   Open **Discover**: with the seed loaded there is no "Connect Supabase" notice, and cards show "Sample data"
   until you mark them verified. Edit a row's `summary` in the Table Editor and refresh to see it change.
    Then open **Account > Memories**: add a memory with a small photo, refresh and confirm both persist
    (Table Editor > memories; Storage > memory-photos > your user id folder). Delete it and confirm the
    photo file is gone too. A second account must not see either.

Without these values the app stays runnable and shows an "Authentication is not configured" notice.

> Live authentication has **not** been tested against a real Supabase project in this repository's
> build. Test sign-up, sign-in, sign-out, session restore and password reset once you connect yours.

## What is real and what is preview

| Area | Status |
| --- | --- |
| Navigation, menus, destination search and filters | Working. Runs against the Supabase `destinations` table, or the built-in sample list as a fallback |
| Destinations | Loaded from Supabase when configured, with loading and error states and a retry. If Supabase is not configured, the request fails or the table is empty, the 12 built-in sample rows are shown with a notice. A "Sample data" badge appears only on rows where `verified` is false. Needs the destinations migration and seed |
| Stories, experiences | Sample content (labelled in the UI) |
| Trip planner (signed in) | Trips are saved per user in Supabase: create, edit, delete, with loading and error states. Needs the trips migration |
| Trip planner (signed out or Supabase not configured) | Local state only, with sample trips. Lost on refresh. Nothing is written to the database |
| AI itineraries | Coming soon (button and copy only) |
| Bookings and payments | Preview only. Nothing can be booked or paid for |
| Language and currency tools | Preview only. No translations or exchange rates are shown |
| Memories (signed in) | Private notes and photos saved per user: add, edit, delete (also deletes the photo file), optional trip link, image preview, file type and size checks. Photos are shown through short-lived signed URLs from a private bucket. Needs the memories migration |
| Memories (signed out or Supabase not configured) | Not available: the page says so and shows no upload controls. Nothing is saved |
| Story publishing | Coming soon |
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

Imagery: no photos are hotlinked because licences cannot be verified, and the seed leaves the image
fields empty. Each destination falls back to generated contour artwork. To use a photo, set `image_url`,
`image_credit` and `image_license` on the row in Supabase (only for images whose licence you have
checked; only http(s) URLs are used). The credit is shown over the photo. Broken URLs fall back to the
artwork automatically.

## Accessibility

Semantic landmarks, skip link, visible focus, 44px touch targets, native `<dialog>` for modals,
labelled form fields with error text, and `prefers-reduced-motion` support.

## Known limitations

- Signed-out trips, filters and sample content are not persisted. Trips are not migrated into an account on sign-in.
- No end-to-end test against live Supabase. Unit and component tests cover filtering, validation,
  trip helpers and the protected route.
- Photo files are removed when you delete a memory or replace its photo (best effort: the app warns if that fails). Deleting a whole user account removes their rows but not their files in storage; clear the `{user id}/` folder in the dashboard if needed.
- Dates are shown in a fixed `en-GB` format and sample prices are USD.
- Single JS bundle (about 100 kB gzipped); route-level code splitting is a later improvement.

## Suggested next phase

1. Story publishing, and sharing memories on purpose (they are private today).
2. Real, reviewed destination content (set `verified = true`) and licensed imagery.
3. Booking provider and payments, then translation and currency services.
4. Profile editing, story publishing and uploads.
