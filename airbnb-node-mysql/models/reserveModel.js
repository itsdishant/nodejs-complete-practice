const db = require("../utils/database");
const { formatInr } = require("../utils/formatter");

const CLEANING_FEE = 1200;
const SERVICE_FEE = 850;

// ponytail: no try/catch here — a failed query throws to the error middleware,
// which renders an error notice instead of silently reporting success.
class Reserve {
  constructor(
    fullName,
    email,
    phoneNumber,
    homeId,
    checkIn,
    checkOut,
    totalPrice,
    paymentMethod,
    numberOfGuests = 1,
    bookingId = Math.random().toString(36).substring(2, 15),
  ) {
    this.bookingId = bookingId;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.homeId = homeId;
    this.checkIn = checkIn;
    this.checkOut = checkOut;
    this.numberOfGuests = Number(numberOfGuests) || 1;
    this.totalPrice = totalPrice;
    this.paymentMethod = paymentMethod;
  }

  async makeReservation() {
    const [rows] = await db.execute(
      "INSERT INTO bookings (id, full_name, email_address, phone_number, from_booking_date, to_booking_date, number_of_guests, home_id, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        this.bookingId,
        this.fullName,
        this.email,
        this.phoneNumber,
        this.checkIn,
        this.checkOut,
        this.numberOfGuests,
        this.homeId,
        this.totalPrice,
        this.paymentMethod,
      ],
    );
    return rows;
  }

  static async getAllBookings() {
    const [rows] = await db.execute(
      "SELECT b.*, h.name AS homeName, h.url AS photo, h.location, h.price FROM bookings b JOIN homes h ON b.home_id = h.id ORDER BY b.created_at DESC",
    );

    return rows.map((row) => ({
      ...row,
      homeId: row.home_id,
      bookingId: row.id,
      checkIn: row.from_booking_date
        ? new Date(row.from_booking_date).toISOString().split("T")[0]
        : "",
      checkOut: row.to_booking_date
        ? new Date(row.to_booking_date).toISOString().split("T")[0]
        : "",
      numberOfGuests: row.number_of_guests || 1,
      totalAmount: row.total_amount,
      formattedPrice: formatInr.format(row.total_amount || row.price),
    }));
  }

  static async getBookingById(id) {
    const [rows] = await db.execute(
      "SELECT b.*, h.name AS homeName, h.url AS photo, h.location, h.price FROM bookings b JOIN homes h ON b.home_id = h.id WHERE b.id = ?",
      [id],
    );
    if (!rows || rows.length === 0) return null;
    const b = rows[0];

    const nights =
      b.from_booking_date && b.to_booking_date
        ? Math.max(
            1,
            Math.round(
              (new Date(b.to_booking_date) - new Date(b.from_booking_date)) /
                86400000,
            ),
          )
        : 1;
    // Amount actually charged per night: derive it from the stored total so the
    // receipt always adds up, even if the host later changes the listing price.
    const paidNightly = Math.round(
      (b.total_amount - CLEANING_FEE - SERVICE_FEE) / nights,
    );
    const nightlyRate = paidNightly > 0 ? paidNightly : b.price || 0;
    // ponytail: label map, keeps the form's raw values out of the receipt copy.
    const paymentLabels = {
      upi: "UPI",
      card: "Card",
      arrival: "Pay at arrival",
    };
    const money = (n) => formatInr.format(n || 0);

    return {
      ...b,
      nights,
      bookingId: b.id,
      homeId: b.home_id,
      fullName: b.full_name,
      email: b.email_address,
      phoneNumber: b.phone_number,
      checkIn: b.from_booking_date
        ? new Date(b.from_booking_date).toISOString().split("T")[0]
        : "",
      checkOut: b.to_booking_date
        ? new Date(b.to_booking_date).toISOString().split("T")[0]
        : "",
      numberOfGuests: b.number_of_guests,
      totalAmount: b.total_amount,
      formattedTotal: money(b.total_amount),
      formattedNightlyRate: money(nightlyRate),
      formattedNightsTotal: money(nightlyRate * nights),
      formattedCleaningFee: money(CLEANING_FEE),
      formattedServiceFee: money(SERVICE_FEE),
      paymentMethod: b.payment_method,
      paymentMethodLabel: paymentLabels[b.payment_method] || b.payment_method,
    };
  }
}

Reserve.CLEANING_FEE = CLEANING_FEE;
Reserve.SERVICE_FEE = SERVICE_FEE;

module.exports = Reserve;
