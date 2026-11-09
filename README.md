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
  assets/brand/ logo SVGs (light and dark), imported through Vite
```

## Design and theming

The theme is the TRABUC brand palette: **black `#010101`, olive `#74743a`, beige `#e8e3d8`**. Every colour,
font, spacing, radius and shadow is a CSS variable in `src/styles/tokens.css`, and no other stylesheet or
component hard-codes a colour. The light theme (beige background, near-black text, olive accent) is the
default; the dark theme (black background, beige text, lightened olive accent) applies automatically with
`prefers-color-scheme: dark`, and either can be forced with `data-theme="light"` or `data-theme="dark"` on
`<html>`.

### Tokens

| Token (`--color-…`) | Light | Dark | Used for | How it was derived |
| --- | --- | --- | --- | --- |
| `bg` | `#E8E3D8` | `#010101` | Page background | brand beige / brand black |
| `surface` | `#F5F2ED` | `#111110` | Cards, inputs, menus | beige tinted toward white / black mixed with beige |
| `surface-2` | `#DAD6C5` | `#1D1C1B` | Bands, footer, hover | beige mixed with olive / black mixed with beige |
| `ink` | `#010101` | `#E8E3D8` | Body text | brand black / brand beige |
| `muted` | `#464542` | `#A7A49C` | Secondary text | black mixed with beige |
| `line` | `#BFBCA1` | `#2F2E2C` | Decorative dividers and card borders | beige mixed with olive / black mixed with beige |
| `border-strong` | `#5F5F30` | `#797771` | Form-control and button borders (3:1 needed) | olive darkened with black / black mixed with beige |
| `brand` | `#74743A` | `#74743A` | Large text, icons, art, decoration | brand olive #74743a (both themes) |
| `accent` | `#464623` | `#A5A37C` | Links, primary buttons, small olive text | olive darkened with black / olive lightened with beige |
| `accent-hover` | `#35351B` | `#B4B191` | Primary button hover | darker / lighter step of accent |
| `accent-ink` | `#E8E3D8` | `#010101` | Text on accent | beige / black |
| `accent-soft` | `#CECBB5` | `#2F2F18` | Soft olive fill (media, hover) | beige mixed with olive / black mixed with olive |
| `focus` | `#010101` | `#E8E3D8` | Focus ring (3px, 2px offset) | black / beige |
| `success, warn, error (+ -bg)` | `#305020`, `#684400`, `#8C241D` | `#9BC47A`, `#E4B863`, `#E88D83` | Notices and badges | semantic hues, not from the brand colours; tinted with beige/black |
| `info-bg` | `#D5D1BF` | `#212111` | Info notices and Sample badge | beige mixed with olive / black mixed with olive |

Olive `#74743a` alone is only 3.8:1 on beige (4.3:1 on black), and neither beige (3.8:1) nor black (4.3:1)
text reaches 4.5:1 on it. So `--color-brand` (exact olive) is used only for large text, icons, borders and
art, while text, links and buttons use `--color-accent`. All text pairings in both themes are 4.5:1 or
better and control borders and focus rings are 3:1 or better. The whole site was audited in headless Chrome
at 320, 375, 768, 1024 and 1440 px in both themes (computed text contrast, horizontal overflow, logo
visibility); the exact ratios are in the pull request / commit notes.

### Changing the brand

1. Edit the three `--brand-*` values and the `--color-*` values in `src/styles/tokens.css` (the light values
   are in `:root`; the dark values appear twice, in the `prefers-color-scheme` block and in
   `:root[data-theme="dark"]`, so keep them in sync).
2. Re-check contrast (text 4.5:1, large text and UI borders 3:1) before committing.
3. Update `theme-color` in `index.html`.

### Logo and icons

- `src/assets/brand/logo-horizontal-light.svg` (black `#010101`, for the light theme) and
  `logo-horizontal-dark.svg` (beige `#e8e3d8`, for the dark theme) are rendered by
  `src/components/Logo.tsx`, imported through Vite so they are hashed and cached. CSS shows the one that
  matches the theme. The link has the accessible name "TRABUC home", and a text "TRABUC" is shown if the image fails.
- `public/favicon.svg`, `public/favicon-32.png` and `public/apple-touch-icon.png` are the TB icon in beige on a
  black tile.
- These are recoloured, size-optimised copies of the horizontal logo and icon from the original
  `TraBuc_Playful_Logo_Kit` (kept outside the repo, unmodified). The kit's own README says the artwork was
  auto-traced from an AI-generated concept, is not an editable vector master, and has no trademark check.
  Have it reviewed (and ideally redrawn) before large-scale printing or filing a trademark.

Plain CSS is used instead of Tailwind to keep dependencies small.

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
