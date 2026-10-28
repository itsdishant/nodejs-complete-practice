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
├── models/              # Mongoose schemas (User, Home, Booking, Wishlist)
├── routes/              # Express routers (user, host, reserve)
├── scripts/             # Database seed script
├── utils/               # Currency formatters (INR)
├── views/               # EJS templates (partials, users, host, reserve, shared)
├── ui-context.md        # Design contract: tokens, components, layout patterns
└── public/              # Static assets (compiled CSS, icons, favicon)
```

## Key Features

- **Browse & Search**: The home page is a search-first index — a destination
  search, a rail of destination chips, and two horizontal rails ("Homes in
  India", "Stays outside India"). The search form submits a real `GET` to the
  catalog, which filters on listing name and location and reports what matched.
- **Authentication & Roles**: Signup and login with separate Guest and Host
  roles.
- **Persistent Sessions**: Backed by MongoDB with dynamic session length (1
  hour standard, 30 days with "Remember me").
- **Header Profile**: Sticky navbar displaying initials avatar, user's full
  name, and role badge.
- **Host Tools**: Create, edit, and delete listings with cascading cleanup of
  related bookings.
- **Guest Experience**: Browse the catalog, view stay details with host info,
  and toggle wishlists.
- **Reservations & Checkout**: Interactive booking with date picker, fee
  breakdown (cleaning and service fees), and booking history.

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Home: search, destinations, country rails |
| `GET` | `/host/homes-list?q=` | Full catalog, optionally filtered |
| `GET` | `/home-detail/:id` | Stay details, host card, booking widget |
| `GET/POST` | `/login`, `/signup` | Authentication |
| `GET` | `/wishlist` | Saved stays for the signed-in guest |
| `POST` | `/wishlist/:id` | Toggle a stay in the wishlist |
| `GET/POST` | `/reserve/:id` | Checkout for a stay |
| `GET` | `/bookings`, `/bookings/:id` | Booking history and receipt |
| `GET` | `/host/host-homes-list` | The host's own listings |
| `GET/POST` | `/host/add-home`, `/host/edit-home/:id` | Create and update a listing |
| `POST` | `/host/delete-home/:id` | Delete a listing and its bookings |
| `GET` | `/logout` | End the session |

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

Guests can be created through `/signup`.

## Available Scripts

- `npm start`: Builds CSS assets and runs the app with Nodemon.
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
