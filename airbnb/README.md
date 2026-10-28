# Airbnb Clone

A full-stack MVC web application built with Node.js, Express, MongoDB, and EJS,
styled with Tailwind CSS v4.

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
├── app.js               # Application setup, session config & routes
├── styles.css           # Tailwind v4 theme tokens & component styles
├── controllers/         # Layout & template rendering controller
├── helpers/             # Form validation & error rendering helpers
├── models/              # Mongoose schemas (User, Home, Booking, Wishlist)
├── routes/              # Express routers (user, host, reserve)
├── utils/               # Currency formatters (INR)
├── views/               # EJS templates (partials, users, host, reserve)
└── public/              # Static assets (compiled CSS, icons, favicon)
```

## Key Features

- **Authentication & Roles**: Signup and login with separate Guest and Host
  roles.
- **Persistent Sessions**: Backed by MongoDB with dynamic session length (1
  hour standard, 30 days with "Remember me").
- **Header Profile**: Sticky navbar displaying initials avatar, user's full
  name, and role badge.
- **Host Tools**: Create, edit, and delete listings with cascading cleanup of
  related bookings.
- **Guest Experience**: Browse catalog, view stay details with host info, and
  toggle wishlists.
- **Reservations & Checkout**: Interactive booking with date picker, fee
  breakdown (cleaning and service fees), and booking history.

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
   PORT=3000
   ```

3. Build CSS assets and start the development server:

   ```bash
   npm start
   ```

4. Open the application at `http://localhost:3000`.

## Available Scripts

- `npm start`: Builds CSS assets and runs the app with Nodemon.
- `npm run build:css`: Compiles Iconoir and processes Tailwind CSS with PostCSS.
- `npm run build:iconoir`: Formats Iconoir SVG stroke widths.
