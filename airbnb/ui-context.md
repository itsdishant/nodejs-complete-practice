# UI Context

## Maintenance Rule

> [!IMPORTANT]
> **Always update this file** whenever any UI pattern, theme token, layout structure, component, or icon usage is introduced, updated, or removed across the application.

---

## Theme

Light only. No dark mode. The visual language is a quiet editorial listing site — crisp white paper, near-black ink, hairline grey rules, and one coral accent used almost exclusively for action.

All colors are declared as Tailwind v4 theme tokens in `styles.css` (`@theme`) and consumed through utility classes. Hex values live in `styles.css` and nowhere else.

| Role           | Token              | Hex       | Utilities                                       |
| -------------- | ------------------ | --------- | ----------------------------------------------- |
| Page / surface | `--color-paper`    | `#ffffff` | `bg-paper`                                      |
| Text           | `--color-ink`      | `#262626` | `text-ink`, `border-ink`, `bg-ink`              |
| Action accent  | `--color-coral`    | `#ff5a5f` | `bg-coral`, `text-coral`, `border-coral`        |
| Tinted fill    | `--color-mist`     | `#eaf3f0` | `bg-mist` (image wells, hover wash)             |
| Hairline       | `--color-pencil`   | `#e5e7e5` | `border-pencil`, `divide-pencil`                |

Tinting is done with opacity modifiers on the tokens, not new colors: `text-ink/70` for intros, `text-ink/60` for muted, `text-ink/50` for faint micro-labels, `border-ink/10` for chrome rules, `bg-coral/5` with `border-coral/30` for selection and alerts.

Surfaces are white on white. A card is separated by `border-pencil` plus `shadow-sm`, never by a grey background. Image wells use `bg-mist`.

Focus is global: `:focus-visible` is a 2px coral outline at 3px offset (`styles.css`). CTAs override the offset to `focus-visible:outline-offset-4`; inputs use `focus:border-coral focus:outline-none` instead of an outline.

Reduced motion is respected globally (`prefers-reduced-motion` in `styles.css`).

**Build step:**

- `npm run build:iconoir`: Reads `iconoir.css`, sets `stroke-width="2"`, and outputs to `public/iconoir.css`.
- `npm run build:css`: Compiles icons and processes `styles.css` with PostCSS into `public/styles.css`.
- Running `node app.js` serves existing builds; always run `npm run build:css` (or `npm start`) after template changes that introduce new Tailwind utilities.

Known exception: the `Confirmed` pill on booking cards uses raw `emerald-*` classes because there is no success token. Promote it to `@theme` rather than adding more raw palette classes.

---

## Logo & Brand Identity

The identity is a plain wordmark, not a logomark.

- **Wordmark:** `airbnb` set in the display face (`font-display`, `font-semibold`, `tracking-tight`, `text-xl sm:text-2xl`) with the trailing period in `text-coral`. Defined inline in `views/partials/header.ejs`, links to `/`, `aria-label="Airbnb home"`.
- **Favicon:** `public/favicon.svg`, declared in `views/partials/head.ejs`.
- **Browser theme color:** `#FF5A5F`, with a per-page `themeColor` local as the override.
- There is no logo component and no icon asset — keep the wordmark as inline markup in the header.

---

## Typography

| Role       | Font          | Token / class                           | Used for                                                                            |
| ---------- | ------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| Display    | Space Grotesk | `--font-display`, `font-display`        | h1/h2, home names, prices, receipt totals                                           |
| Body       | DM Sans       | `--font-body`, body default             | Copy, labels, inputs, navigation                                                    |
| Mono       | DM Mono       | `--font-mono`, `font-mono`              | Booking IDs, the registered email on the signup confirmation, and record references |

All three are loaded from Google Fonts in `styles.css`; `body` is DM Sans with `antialiased`.

Type scale:

- Hero (home): `text-4xl sm:text-6xl lg:text-7xl`, `leading-[1.08]`, `tracking-tight`.
- Page h1 (listings, bookings, 404): `text-4xl sm:text-5xl`, `font-medium`.
- Page h1 (detail pages): `text-3xl sm:text-4xl lg:text-5xl`, `tracking-tight`.
- Page h1 (auth and form pages): `text-3xl sm:text-4xl`.
- Section h2: `font-display text-xl` (in-page sections) or `text-2xl sm:text-3xl` (home sections).
- Body copy: `text-base leading-7` for prose, `text-sm` for dense rows, `text-xs` for metadata.
- Micro-labels: `text-xs font-semibold uppercase text-ink/50` to `text-ink/70`.

Headings are `font-medium` (500). The only heavier weights are the wordmark (`font-semibold`), prices/totals (`font-semibold`), and buttons (`font-semibold`). Never bold a heading to add emphasis.

---

## Border Radius

Radius is small and consistent — near-square surfaces are the signature.

| Context                                                            | Class          |
| ------------------------------------------------------------------ | -------------- |
| Cards, panels, images, inputs, buttons                             | `rounded-sm`   |
| Navigation pills, wishlist button, booking ID chip, filter chips   | `rounded-full` |
| Status pills on booking cards                                      | `rounded-xs`   |

Do not introduce `rounded-md` or larger for containers, and do not square off the navigation pills or the booking ID chip.

---

## Icons (Iconoir)

- Powered by **Iconoir** via CSS classes (`<i class="iconoir-..."></i>`).
- Compiled into `public/iconoir.css` with a standardized `stroke-width="2"`.
- Linked in `views/partials/head.ejs` via `<link rel="stylesheet" href="/iconoir.css" />`.
- Raw inline SVGs and Font Awesome have been completely replaced by Iconoir.
- Common icons in use:
  - Navigation: `iconoir-compass` (Explore), `iconoir-calendar` (Bookings), `iconoir-heart` (Wishlist), `iconoir-home` (Your listings), `iconoir-sparks` (Airbnb your home), `iconoir-log-in` (Login), `iconoir-log-out` (Logout).
  - Metadata: `iconoir-map-pin` (Location), `iconoir-mail` (Contact email).
  - Wishlist toggle: `iconoir-heart` (unfavourited) and `iconoir-heart-solid` (favourited).

---

## Forms

Every form is a centered, width-capped panel. The panel reuses the same vocabulary as the receipt and summary cards, so inputs and money read as one family.

### Placement and width

| Surface | Column | Form |
| ------- | ------ | ---- |
| `/login`, `/signup`, `/host/add-home`, `/host/edit-home` | `mx-auto w-full max-w-md` (448px) | `w-full`, centered and vertically centered by the shell |
| `/reserve/:id` checkout | left column `max-w-2xl` (672px), `lg:col-span-7` | `w-full` inside the column |
| Listing detail booking widget | `lg:col-span-5 xl:col-span-4` sidebar | `w-full` inside the reservation card |

A form never spans the page. When a form lives in a column, cap the column — not just the form — so the section rule and the panel share an edge.

### Panel

```text
rounded-sm border border-pencil bg-white p-6 shadow-sm
```

Standalone form pages add `space-y-5` (auth) or `space-y-6` (listing); checkout adds `space-y-8`. The listing detail booking form sits inside the aside card and gets **no** second border.

### Fields

Standard density: `min-h-12 w-full rounded-sm border border-pencil bg-paper px-4 text-base placeholder:text-ink/40 focus:border-coral focus:outline-none`.

Checkout & date/guest picker density: `min-h-11 ... px-3 text-sm` or compact grid `p-2.5`, with uppercase micro-labels above each field.

Labels are always present and bound with `for`/`id` — placeholders never replace them. Auth and host forms use `block text-sm font-medium`; checkout uses `text-xs font-semibold uppercase text-ink/70`.

Option rows (payment method, account role) are `flex cursor-pointer items-center justify-between rounded-sm border p-4`: selected is `border-coral bg-coral/5`, unselected is `border-pencil bg-white hover:border-ink/30`. Signup role cards use `has-checked:border-coral has-checked:bg-coral/5` so the state follows the radio itself.

### Errors and actions

Errors render above the panel as `rounded-sm border border-coral/30 bg-coral/5 px-4 py-3 text-sm text-ink` with `role="alert"`. Never a bare red text line.

One primary action per form: `bg-coral text-white hover:bg-ink`, full width inside auth/host panels and `sm:w-auto` on the listing forms. Secondary actions are outline buttons (`border-pencil bg-white hover:border-ink hover:bg-mist`).

Non-layout forms — the wishlist toggle and the delete-listing button — are inline `<form>` elements wrapping a single button. They never receive panel styling.

---

## Component Library

No component framework and no design-system package. Tailwind utilities plus reusable component classes in `styles.css`: `.nav-link`, `.nav-link-active`, and `.no-scrollbar`.

Reusable EJS partials in `views/`:

| Partial | Contract |
| ------- | -------- |
| `partials/content.ejs` | Document shell: doctype, head, header, `<main>`, and centered `<div class="mx-auto w-full max-w-[1120px]">` bounding `<%- body %>`. |
| `partials/head.ejs` | Meta, theme color, `<title>`, iconoir CSS, and stylesheet links. |
| `partials/header.ejs` | Sticky solid white navigation; reads `currentPath`, `cookies.isLoggedIn`, and `cookies.userDetails.role`. |
| `shared/booking-id.ejs` | Highlighted record identifier; takes `{ id }`. |
| `shared/single-home-card.ejs` | Listing card (image, name, location, price); takes `{ home }`. |
| `shared/toggle-wishlist-form.ejs` | Save/unsave wishlist button form; takes `{ home, showLabel }`. Label displays `"Wishlist"` (or `"Saved"` when active). |
| `shared/add-edit-home-success.ejs` | Post-publish confirmation summary. |

Views are fragments only. `controllers/appController.js` renders the fragment, then injects it into `partials/content.ejs` as `body`; page helpers are `homeController`, `hostController`, `reserveController`, `sharedController`, `userController`.

---

## Layout Patterns

- **Standard Global Container (1120px):** Matching [airbnb.co.in](https://www.airbnb.co.in) room pages, the global document shell in `partials/content.ejs` wraps all page content inside `<div class="mx-auto w-full max-w-[1120px]">`.
- **Navbar Width:** The header navbar in `partials/header.ejs` constrains its inner `<nav>` to `mx-auto flex w-full max-w-[1120px] items-center justify-between` so the logo and links align with the page content below.
- **Centered pages:** the shell adds `flex items-center justify-center` for `/login`, `/signup`, `/host/add-home`, `/host/edit-home`.
- **Page header:** `border-b border-pencil pb-8`, h1 plus `mt-3 text-base text-ink/70` intro, optional right-aligned action in a `sm:flex-row sm:items-end sm:justify-between` row.
- **Listing and booking grids:** `grid gap-6 sm:grid-cols-2 lg:grid-cols-4`, items `overflow-hidden rounded-sm border border-pencil bg-white`.
- **Home Detail Page Layout (`views/host/home-detail.ejs`):**
  - Uses an asymmetric 2-column grid (`grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16`).
  - **Left Column (`lg:col-span-7 xl:col-span-8`)**:
    - Listing title `h1` at top.
    - Directly below title: a flex row (`flex items-center justify-between gap-4`) holding **Location** on the left and the **Wishlist button** on the right (rendered for guests).
    - Featured Image Banner: Width matches the column/description below, with standard height (`h-80 sm:h-96 lg:h-[460px] w-full object-cover`).
    - "About this home" description.
  - **Right Column (`lg:col-span-5 xl:col-span-4`)**:
    - Sticky sidebar container (`sticky top-6 space-y-4`).
    - **Card 1: Reservation Form Card** (with date pickers, guests selector, and Reserve button for logged-in users; "Login to reserve" CTA for logged-out users; hidden for hosts).
    - **Card 2: Listing Details Card** (compact key-value rows for Location, Price per night, and Photo link).
    - **Card 3: Host Information Card** (Host avatar initial, full name, "Hosting since [Month Year]", and contact email).
- **Empty states:** `max-w-xl py-12`, `font-display text-2xl font-medium` heading, `text-sm leading-6 text-ink/60` copy, one coral CTA. Left-aligned in the content flow — never centered on the page.
- **Hover:** cards change border to `border-ink/30` or title to `text-coral`; only images scale (`group-hover:scale-105`). No card lift, no shadow growth.

---

## Page Chrome

### Navbar

Sticky (`sticky top-0 z-40`), solid white background (`bg-white`) matching [airbnb.co.in](https://www.airbnb.co.in), separated by a subtle border (`border-b border-[#ebebeb]`).

- Left: the `airbnb.` wordmark (`font-display font-semibold tracking-tight text-xl sm:text-2xl` with trailing dot in `text-coral`).
- Right: Uniform `.nav-link` pills with Iconoir icons. Dynamic based on role:
  - **Guest / Authenticated:** Explore (`iconoir-compass`), Bookings (`iconoir-calendar`), Wishlist (`iconoir-heart`), Logout (`iconoir-log-out`).
  - **Host:** Your listings (`iconoir-home`), Airbnb your home (`iconoir-sparks`), Logout (`iconoir-log-out`).
  - **Logged out:** Login (`iconoir-log-in`).
- All links share a consistent `.nav-link` pill appearance (white pill, `border-pencil` hairline, `text-xs` label, icon, and `rounded-full`). Hover washes to `bg-mist` with an ink border. Active is a solid coral pill (`bg-coral text-white font-semibold`).

### Buttons

- Primary: `inline-flex min-h-12 items-center justify-center rounded-sm bg-coral px-6 text-sm font-semibold text-white transition-colors hover:bg-ink focus-visible:outline-offset-4`. Compact variant: `min-h-11 px-5`.
- Secondary: same geometry with `border border-pencil bg-white text-ink hover:border-ink hover:bg-mist`.
- Text link: `text-sm font-semibold text-coral underline underline-offset-4 hover:text-ink`.
- Wishlist Toggle: `rounded-full border px-4 py-2 text-sm font-semibold shadow-xs` with `iconoir-heart` (or `iconoir-heart-solid` when saved) and label `"Wishlist"` / `"Saved"`.
- No gradients, no pill-shaped CTAs (pills are reserved for navigation, chips, and the wishlist toggle).

### Money surfaces

Receipt and price panels share one structure: hairline-divided rows (`flex justify-between gap-4`, label `text-ink/75`, value `text-ink font-medium`), an `<hr class="border-pencil">`, then a total row with `font-display text-2xl font-semibold`. The checkout and receipt asides are `sticky top-6`.

The listing detail widget pairs a `font-display text-2xl sm:text-3xl` price with a `/ night` suffix in `text-sm text-ink/60` inside the listing details card.
