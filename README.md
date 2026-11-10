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

The theme is the TRABUC brand palette: **near black `#111111`, charcoal `#2f2f2f`, off white `#f6f6f6`, amber
`#ffcb74`**. Every colour, font, spacing, radius and shadow is a CSS variable in `src/styles/tokens.css`, and no
other stylesheet or component hard-codes a colour. The light theme (off-white background, near-black text) is the
default; the dark theme (near-black background, charcoal surfaces, off-white text, amber accent) applies
automatically with `prefers-color-scheme: dark`, and either can be forced with `data-theme="light"` or
`data-theme="dark"` on `<html>`.

### The amber rule

Amber is 12.6:1 on `#111111` but only **1.4:1 on `#f6f6f6`**. So in the light theme amber is used **only as a fill**
(primary buttons, selected chips, the avatar, soft highlights) with `#111111` text on it and a darker outline
(`--color-accent-edge`). It is never text, a link or a thin icon there. Links, icons and active underlines use
`--color-link` and `--color-accent-fg`, which are near black in light mode (links are always underlined) and amber
in dark mode. If you add UI, use `--color-accent` for fills and `--color-accent-fg` / `--color-link` for anything thin.

### Tokens

| Token (`--color-…`) | Light | Dark | Used for | Notes |
| --- | --- | --- | --- | --- |
| `bg` | `#f6f6f6` | `#111111` | Page background |  |
| `surface` | `#ffffff` | `#2f2f2f` | Cards, inputs, menus, dialogs | light: white, the lightest tint of off white / dark: charcoal |
| `surface-2` | `#e6e6e6` | `#202020` | Bands, footer, hover | derived (mix of off white/charcoal, or black/charcoal) |
| `ink` | `#111111` | `#f6f6f6` | Body text |  |
| `muted` | `#2f2f2f` | `#bebebe` | Secondary text | light: charcoal / dark: derived (charcoal toward off white) |
| `line` | `#cecece` | `#2f2f2f` | Dividers and card borders (decorative) | light: derived / dark: charcoal |
| `border-strong` | `#2f2f2f` | `#898989` | Form-control and button borders (3:1) | light: charcoal / dark: derived |
| `link` | `#111111` | `#ffcb74` | Links (always underlined) | light: near black / dark: amber |
| `accent` | `#ffcb74` | `#ffcb74` | Fills: primary buttons, selected chips, avatar | amber (both themes) |
| `accent-hover` | `#e2b568` | `#fcd89b` | Primary button hover | derived (amber toward black / off white) |
| `accent-ink` | `#111111` | `#111111` | Text on amber | near black |
| `accent-edge` | `#6b5837` | `#ffcb74` | Outline on amber fills (3:1 against the page) | light: derived (amber toward black) / dark: amber |
| `accent-soft` | `#f9e9cf` | `#372f21` | Soft highlight fill (media, art, hover) | derived (amber tint) |
| `accent-fg` | `#111111` | `#ffcb74` | Icons, active underline, art lines, notice bar | light: near black / dark: amber |
| `focus / focus-inner` | `#111111` + `#ffcb74` | `#ffcb74` + `#111111` | Focus ring: 3px outer + 2px inner | light: near black + amber / dark: amber + near black |
| `success, warn, error` | `#245739` `#413625` `#9d3126` | `#7dca9c` `#ffcb74` `#f19286` | Notice and badge text | success/error: semantic hues tinted with the palette; warn: derived from amber |
| `success-bg, warn-bg, error-bg` | `#d6e3db` `#fae0b5` `#efdddc` | `#1f3026` `#372f21` `#472320` | Notice and badge backgrounds | derived tints |
| `info-bg` | `#e2e2e2` | `#222222` | Info notices, Sample badge | derived |

Derived colours are mixes of the four brand colours (white is used only as the lightest tint of off white). Success
and error are the only hues that cannot come from the palette, so they are semantic colours tinted to sit in it.

### Contrast (WCAG)

| Pairing | Light | Dark | Needs |
| --- | --- | --- | --- |
| ink on bg | 17.5 | 17.5 | 4.5:1 |
| ink on surface | 18.9 | 12.4 | 4.5:1 |
| muted on bg | 12.4 | 10.2 | 4.5:1 |
| muted on surface | 13.4 | 7.2 | 4.5:1 |
| muted on surface-2 | 10.7 | 8.8 | 4.5:1 |
| link on bg | 17.5 | 12.6 | 4.5:1 |
| link on surface | 18.9 | 9.0 | 4.5:1 |
| accent-ink on accent (primary button) | 12.6 | 12.6 | 4.5:1 |
| accent-ink on accent-hover | 9.9 | 13.9 | 4.5:1 |
| success / warn / error text on their tint | 6.4 / 9.2 / 5.5 | 7.2 / 8.8 / 6.0 | 4.5:1 |
| border-strong on bg / surface (controls) | 12.4 / 13.4 | 5.4 / 3.8 | 3:1 |
| accent-edge on bg (primary button outline) | 6.3 | 12.6 | 3:1 |
| accent-fg on bg (icons, underline) | 17.5 | 12.6 | 3:1 |
| focus ring on bg | 17.5 | 12.6 | 3:1 |
| focus ring on surface | 18.9 | 9.0 | 3:1 |

Every text pairing is at least 4.5:1 and every control border, outline and focus ring at least 3:1, in both themes.
The whole site was also audited in headless Chrome at 320, 375, 768, 1024 and 1440 px in both themes (computed text
contrast on every text node, horizontal overflow, logo visibility).

### Changing the brand

1. Edit the `--brand-*` values and the `--color-*` values in `src/styles/tokens.css` (light values are in `:root`;
   the dark values appear twice, in the `prefers-color-scheme` block and in `:root[data-theme="dark"]`, so keep them in sync).
2. Re-check contrast (text 4.5:1; large text, control borders and focus rings 3:1) before committing.
3. Update `theme-color` in `index.html`.

### Logo and icons

- `src/assets/brand/logo-horizontal-light.svg` (`#111111`, for the light theme) and `logo-horizontal-dark.svg`
  (amber `#ffcb74`, for the dark theme) are rendered by `src/components/Logo.tsx`, imported through Vite so they
  are hashed and cached. CSS shows the one that matches the theme. The link is named "TRABUC home", and the text
  "TRABUC" is shown if the image fails. For an off-white logo on dark instead, swap the fill in the dark file to `#f6f6f6`.
- `public/favicon.svg` is the TB icon in amber on a near-black tile. `public/favicon-32.png` and
  `public/apple-touch-icon.png` are the kit's own 32 px and 180 px app icons.
- The SVGs are size-optimised copies (110 KB down to 37 KB) of the horizontal logo from the original
  `TraBuc_Playful_Logo_Kit` (kept outside the repo, unmodified). The kit's own README says the artwork was auto-traced
  from an AI-generated concept, is not an editable vector master, and has no trademark check. Have it reviewed (and
  ideally redrawn) before large-scale printing or filing a trademark.

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
