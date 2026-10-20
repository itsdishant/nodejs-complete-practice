// notyf is a browser library, so the server can't show a toast directly. A notice
// is attached to the next render and partials/content.ejs fires it client-side.
// Redirecting POSTs carry an allowlisted ?notice=<code>, so no user text ever
// reaches the page script.
const CODES = {
  "listing-published": { type: "success", message: "Listing published." },
  "listing-updated": { type: "success", message: "Listing updated." },
  "listing-deleted": { type: "success", message: "Listing deleted." },
  "favourite-saved": { type: "success", message: "Saved to your favourites." },
  "favourite-removed": { type: "success", message: "Removed from your favourites." },
  "booking-confirmed": { type: "success", message: "Reservation confirmed." },
};

const forCode = (code) => CODES[code] || null;

// For failures raised in the request itself (validation, DB errors).
const error = (message) => ({ type: "error", message });

module.exports = { CODES, forCode, error };
