# UI Context

## Theme

Light only. No dark mode. The visual language is a quiet editorial listing site — white paper, near-black ink, hairline grey rules, and one coral accent used almost exclusively for action.

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

**Build step.** `styles.css` is compiled to `public/styles.css` by `postcss` (`npm run build:css`). Only `npm start` rebuilds it — running `node app.js` serves the last build, so template changes that introduce new utility classes will silently render unstyled until the sheet is rebuilt.

Known exception: the `Confirmed` pill on booking cards uses raw `emerald-*` classes because there is no success token. Promote it to `@theme` rather than adding more raw palette classes.

## Logo & Brand Identity

The identity is a plain wordmark, not a logomark.

- **Wordmark:** `airbnb` set in the display face (`font-display`, `font-semibold`, `tracking-tight`, `text-xl sm:text-2xl`) with the trailing period in `text-coral`. Defined inline in `views/partials/header.ejs`, links to `/`, `aria-label="Airbnb home"`.
- **Favicon:** `public/favicon.svg`, declared in `views/partials/head.ejs`.
- **Browser theme color:** `#FF5A5F`, with a per-page `themeColor` local as the override.
- There is no logo component and no icon asset — keep the wordmark as inline markup in the header.

## Typography

| Role       | Font          | Token / class                           | Used for                                    |
| ---------- | ------------- | --------------------------------------- | ------------------------------------------- |
| Display    | Space Grotesk | `--font-display`, `font-display`        | h1/h2, home names, prices, receipt totals   |
| Body       | DM Sans       | `--font-body`, body default             | Copy, labels, inputs, navigation            |
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

## Border Radius

Radius is small and consistent — near-square surfaces are the signature.

| Context                                                            | Class          |
| ------------------------------------------------------------------ | -------------- |
| Cards, panels, images, inputs, buttons                             | `rounded-sm`   |
| Navigation pills, wishlist button, booking ID chip, filter chips   | `rounded-full` |
| Status pills on booking cards                                      | `rounded-xs`   |

Do not introduce `rounded-md` or larger for containers, and do not square off the navigation pills or the booking ID chip.

## Forms

Every form is a centered, width-capped panel. The panel reuses the same vocabulary as the receipt and summary cards, so inputs and money read as one family.

### Placement and width

| Surface | Column | Form |
| ------- | ------ | ---- |
| `/login`, `/signup`, `/host/add-home`, `/host/edit-home` | `mx-auto w-full max-w-md` (448px) | `w-full`, centered and vertically centered by the shell |
| `/reserve/:id` checkout | left column `max-w-2xl` (672px), `lg:col-span-7` | `w-full` inside the column |
| Listing detail booking widget | `lg:col-span-1` aside | `w-full max-w-md` inside the existing card |

A form never spans the page. When a form lives in a column, cap the column — not just the form — so the section rule and the panel share an edge.

### Panel

```text
rounded-sm border border-pencil bg-white p-6 shadow-sm
```

Standalone form pages add `space-y-5` (auth) or `space-y-6` (listing); checkout adds `space-y-8`. The listing detail booking form sits inside the aside card and gets **no** second border.

### Fields

Standard density: `min-h-12 w-full rounded-sm border border-pencil bg-paper px-4 text-base placeholder:text-ink/40 focus:border-coral focus:outline-none`.

Checkout density: `min-h-11 ... px-3 text-sm`, with uppercase micro-labels above each field.

Labels are always present and always bound with `for`/`id` — placeholders never replace them. Auth and host forms use `block text-sm font-medium`; checkout uses `text-xs font-semibold uppercase text-ink/70`.

Option rows (payment method, account role) are `flex cursor-pointer items-center justify-between rounded-sm border p-4`: selected is `border-coral bg-coral/5`, unselected is `border-pencil bg-white hover:border-ink/30`. Signup role cards use `has-checked:border-coral has-checked:bg-coral/5` so the state follows the radio itself.

### Errors and actions

Errors render above the panel as `rounded-sm border border-coral/30 bg-coral/5 px-4 py-3 text-sm text-ink` with `role="alert"`. Never a bare red text line.

One primary action per form: `bg-coral text-white hover:bg-ink`, full width inside auth/host panels and `sm:w-auto` on the listing forms. Secondary actions are outline buttons (`border-pencil bg-white hover:border-ink hover:bg-mist`).

Non-layout forms — the wishlist toggle and the delete-listing button — are inline `<form>` elements wrapping a single button. They never receive panel styling.

## Component Library

No component framework and no design-system package. Tailwind utilities plus four component classes in `styles.css`: `.nav-link`, `.nav-cta` (with `.nav-link-active` / `.nav-cta-active`), and `.no-scrollbar`.

Reusable EJS partials in `views/`:

| Partial | Contract |
| ------- | -------- |
| `partials/content.ejs` | Document shell: doctype, head, header, `<main>`, `<%- body %>`. The only file allowed to contain `<!doctype>`, `<html>`, or `<body>`. |
| `partials/head.ejs` | Meta, theme color, `<title>`, stylesheet link. |
| `partials/header.ejs` | Sticky navigation; reads `currentPath`. |
| `shared/booking-id.ejs` | Highlighted record identifier; takes `{ id }`. |
| `shared/single-home-card.ejs` | Listing card (image, name, location, price); takes `{ home }`. |
| `shared/toggle-wishlist-form.ejs` | Save/unsave button form; takes `{ home, showLabel }`. |
| `shared/add-edit-home-success.ejs` | Post-publish confirmation summary. |

Views are fragments only. `controllers/appController.js` renders the fragment, then injects it into `partials/content.ejs` as `body`; page helpers are `homeController`, `hostController`, `reserveController`, `sharedController`, `userController`.

## Layout Patterns

- **Shell:** `<main class="w-full min-h-[calc(100svh-5rem)] px-4 py-8 sm:px-6 sm:py-12">`. There is no global max-width container — each page constrains its own content.
- **Centered pages:** the shell adds `flex items-center justify-center` for `/login`, `/signup`, `/host/add-home`, `/host/edit-home`. These are the only vertically centered pages. The signup confirmation is centered too, but only because the POST that renders it reports `currentPath` as `/signup`; there is no GET `/signup-success` route.
- **Page header:** `border-b border-pencil pb-8`, h1 plus `mt-3 text-base text-ink/70` intro, optional right-aligned action in a `sm:flex-row sm:items-end sm:justify-between` row.
- **Listing and booking grids:** `grid gap-6 sm:grid-cols-2 lg:grid-cols-4`, items `overflow-hidden rounded-sm border border-pencil bg-white`.
- **Detail pages:** `grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12`; content `lg:col-span-7`, sticky aside `lg:col-span-5` (`sticky top-6 rounded-sm border border-pencil bg-white p-6 shadow-sm`). The listing detail page uses a 3-column grid (`lg:col-span-2` / `lg:col-span-1`) instead.
- **Section rhythm (home):** `mt-20 border-t border-pencil pt-16 sm:mt-24 sm:pt-20` between major sections.
- **Empty states:** `max-w-xl py-12`, `font-display text-2xl font-medium` heading, `text-sm leading-6 text-ink/60` copy, one coral CTA. Left-aligned in the content flow — never centered on the page.
- **Hover:** cards change border to `border-ink/30` or title to `text-coral`; only images scale (`group-hover:scale-105`). No card lift, no shadow growth.

## Page Chrome

This is the locked visual language for the shared header and the money surfaces. New pages compose inside it.

### Navbar

Sticky (`sticky top-0 z-40`), translucent white (`bg-white/95` with `backdrop-blur-md`), separated by `border-b border-ink/10`. No solid bar, no shadow.

- Left: the `airbnb.` wordmark.
- Right, in order: `.nav-link` pills for **Explore**, **Bookings**, **Wishlist**, **Your listings**; a `hidden h-5 w-px bg-pencil sm:block` divider; then `.nav-cta` pills for **Airbnb your home** and **Login**.
- `.nav-link` is a white pill with a `border-pencil` hairline, `text-xs` label, icon, and `rounded-full`. Hover washes to `bg-mist` with an ink border. Active is a solid coral pill with white text and `font-semibold`.
- `.nav-cta` is an ink-filled pill with a coral icon and white label; hover turns the whole pill coral. Active adds a coral fill and a 2px coral ring.
- The link group scrolls horizontally on mobile (`no-scrollbar`) and never wraps. Do not turn the pills into rectangles, drop the sticky blur, or add a second navigation row.

### Buttons

- Primary: `inline-flex min-h-12 items-center justify-center rounded-sm bg-coral px-6 text-sm font-semibold text-white transition-colors hover:bg-ink focus-visible:outline-offset-4`. Compact variant: `min-h-11 px-5`.
- Secondary: same geometry with `border border-pencil bg-white text-ink hover:border-ink hover:bg-mist`.
- Text link: `text-sm font-semibold text-coral underline underline-offset-4 hover:text-ink`.
- No gradients, no pill-shaped CTAs (pills are reserved for navigation and chips), no icon-only buttons except the wishlist toggle.

### Money surfaces

Receipt and price panels share one structure: hairline-divided rows (`flex justify-between gap-4`, label `text-ink/75`, value `text-ink font-medium`), an `<hr class="border-pencil">`, then a total row with `font-display text-2xl font-semibold`. The checkout and receipt asides are `sticky top-6`.

The listing detail widget pairs a `font-display text-2xl sm:text-3xl` price with a `/ night` suffix in `text-sm text-ink/60`, above the date/guest form.

### Record identifiers

`shared/booking-id.ejs` renders `Booking ID: <id>` as a `rounded-full border border-coral/30 bg-coral/5 px-3 py-1 font-mono text-xs font-semibold text-coral` chip. It is the only coral chip in the app and the only place the mono face is used for prose. Booking cards show a quieter `font-mono text-[11px] text-ink/40` short reference instead.

## Icons

Inline SVG only — no icon package, no icon font. Every icon is a 24×24 `viewBox`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.8"`, round caps and joins, `aria-hidden="true"`.

Sizes: `h-3.5 w-3.5` with an `sm:h-4 sm:w-4` step in the navigation, `h-4 w-4` inline and in buttons.

The location pin on booking pages is the one deliberate deviation: `stroke-width="2"` and `text-coral`.
