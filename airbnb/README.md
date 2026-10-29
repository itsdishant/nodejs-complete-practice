# Airbnb Clone

A full-stack MVC web application built with Node.js, Express, MongoDB, and EJS,
styled with Tailwind CSS v4. It covers the whole rental loop — browse and search
stays, save a wishlist, book with a fee breakdown, and manage listings as a host.

The catalog is seeded from real listings on [airbnb.co.in](https://www.airbnb.co.in):
42 stays across India and abroad, spread over seven hosts.

## Tech Stack

| Layer | Technology |
| --- | --- |
| **Runtime** | [Node.js](https://nodejs.org/) (v18+) |
| **Framework** | [Express 5](https://expressjs.com/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/) |
| **Sessions** | `express-session` with `connect-mongodb-session` store |
| **View Engine** | [EJS](https://ejs.co/) with custom layout shell |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [PostCSS](https://postcss.org/) |
| **Icons** | [Iconoir](https://iconoir.com/) |

## Project Structure

```text
airbnb/
├── app.js               # Application setup, session config & route mounting
├── styles.css           # Tailwind v4 theme tokens & component styles
├── controllers/         # Layout & template rendering controller
├── helpers/             # Home queries, form validation & error rendering
├── middlewares/         # Route guards & role-based access control (RBAC)
├── models/              # Mongoose schemas & cascade cleanup hooks (User, Home, Booking, Wishlist)
├── routes/              # Express routers (user, host, reserve)
├── scripts/             # Database seed script
├── utils/               # Currency formatters (INR)
├── views/               # EJS templates (partials, users, host, reserve, shared)
├── ui-context.md        # Design contract: tokens, components, layout patterns
└── public/              # Static assets (compiled CSS, icons, favicon)
```

## Key Features

- **Browse & Search**: Search-first landing page with destination suggestions,
  quick city chips, and regional listing rails. Filter queries run directly
  against listing names and locations.
- **Authentication & RBAC**: Dedicated traveller and host roles. A centralized
  `routeGuard` middleware protects routes by redirecting unauthenticated users
  to `/login` and role-mismatched users to `/`.
- **Persistent Sessions**: Stored in MongoDB using `connect-mongodb-session`.
- **Cascade Cleanup**: Mongoose `findOneAndDelete` lifecycle hooks purge dependent
  documents automatically: deleting a home removes its bookings and wishlist
  entries; deleting a host removes their listings, reservations, and bookmarks.
- **Header & Navigation**: Sticky header on a grey band with pill links and an
  identity chip showing the user's name, role, and avatar. On mobile viewports,
  it collapses into a clean dropdown menu.
- **Host Workspace**: Add, edit, and delete properties (`/host/homes`). Review
  guest reservations, schedules, and payouts on dedicated summary and detail
  pages (`/host/bookings`).
- **Traveller Stays & Bookings**: Browse listings, save favorites to a wishlist,
  and book stays with dynamic pricing breakdowns (nights, cleaning fee, and
  service fee).

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Home: search, destinations, country rails |
| `GET` | `/homes?q=` | Full catalog, optionally filtered |
| `GET` | `/home-detail/:id` | Stay details, host card, booking widget |
| `GET/POST` | `/login`, `/signup` | Authentication |
| `GET` | `/wishlist` | Saved stays for the signed-in Traveller |
| `POST` | `/wishlist/:id` | Toggle a stay in the wishlist |
| `GET/POST` | `/reserve/:id` | Checkout for a stay |
| `GET` | `/bookings`, `/bookings/:id` | Booking history and receipt |
| `GET` | `/host/homes` | The signed-in host's own listings |
| `GET` | `/host/bookings`, `/host/bookings/:id` | Host reservations & payouts |
| `GET/POST` | `/host/add-home`, `/host/edit-home/:id` | Manage listings |
| `POST` | `/host/delete-home/:id` | Delete a listing and its bookings |
| `GET` | `/logout` | End the session |

## Design

The interface is a quiet editorial listing site — white paper, near-black ink,
hairline rules, and one coral accent used almost exclusively for action. Every
colour is declared as a Tailwind v4 theme token in `styles.css` (`paper`,
`cloud`, `ink`, `coral`, `mist`, `pencil`) and consumed through utilities, so
colour decisions live in one file — the `theme-color` meta tag in
`partials/head.ejs` is the only hex outside it.

`ui-context.md` is the design contract: the token table, type scale, radius
rules, form and layout patterns, and the header specification. Change it in the
same commit as any UI change.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- MongoDB database (local or Atlas)

### Setup & Run

1. Clone and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
   ```

3. Seed the catalog (optional, but the app is empty without it):

   ```bash
   npm run seed
   ```

4. Build CSS assets and start the development server:

   ```bash
   npm start
   ```

5. Open the application at `http://localhost:3000`.

## Demo Accounts

`npm run seed` creates seven hosts. Every seeded host logs in with the email
below and the first name in lowercase as the password.

| Host | Email | Password |
| --- | --- | --- |
| Asha Matty | `asha.matty@example.com` | `asha123` |
| Rohan Deshpande | `rohan.deshpande@example.com` | `rohan123` |
| Meera Krishnan | `meera.krishnan@example.com` | `meera123` |
| Aditya Rathore | `aditya.rathore@example.com` | `aditya123` |
| Priya Nambiar | `priya.nambiar@example.com` | `priya123` |
| Wayan Sukarta | `wayan.sukarta@example.com` | `wayan123` |
| Camille Laurent | `camille.laurent@example.com` | `camille123` |

Travellers can be created through `/signup`.

## Available Scripts

- `npm start`: Builds CSS assets and runs the app with Nodemon.
- `npm test`: Runs automated database tests with Node.js built-in test runner.
- `npm run seed`: Creates the seven demo hosts and 42 stays — 30 in India, 12
  abroad. Safe to re-run; hosts are matched by email and stays by host + name,
  so a second run creates nothing and never deletes existing data.
- `npm run build:css`: Compiles Iconoir and processes Tailwind CSS with PostCSS.
- `npm run build:iconoir`: Formats Iconoir SVG stroke widths.

## Data Notes

- Listing names, photos, and localities come from the live Airbnb listing pages,
  pinned per row to the real listing id so they cannot drift apart. Prices are a
  snapshot of the 2-night total quoted for 1–3 Dec 2026, halved to a nightly rate
  with fees included.
- Photos are hotlinked from `a0.muscache.com` and remain the property of their
  owners. They are here for a practice project, not for redistribution.
- Passwords are stored in plaintext to keep the demo simple. Do not reuse this
  authentication code as-is.
