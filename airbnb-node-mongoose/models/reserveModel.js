const { formatInr } = require("../utils/formatter");

const CLEANING_FEE = 1200;
const SERVICE_FEE = 850;

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
  ) {
    this.homeId = homeId;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.checkIn = checkIn;
    this.checkOut = checkOut;
    this.numberOfGuests = Number(numberOfGuests) || 1;
    this.totalPrice = totalPrice;
    this.paymentMethod = paymentMethod;
    this.createdAt = new Date();
  }

  async makeReservation() {}

  static async getAllBookings() {
    const rows = await getDatabase()
      .collection("bookings")
      .aggregate([
        {
          $lookup: {
            from: "homes",
            let: {
              homeObjectId: {
                $convert: {
                  input: "$homeId",
                  to: "objectId",
                  onError: null,
                  onNull: null,
                },
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$homeObjectId"],
                  },
                },
              },
            ],
            as: "home_details",
          },
        },
      ])
      .toArray();

    return rows.map((row) => {
      const home = row.home_details[0];

      return {
        ...row,
        homeName: home?.name,
        location: home?.location,
        photo: home?.url,
        bookingId: row._id,
        checkIn: row.checkIn
          ? new Date(row.checkIn).toISOString().split("T")[0]
          : "",
        checkOut: row.checkOut
          ? new Date(row.checkOut).toISOString().split("T")[0]
          : "",
        numberOfGuests: row.numberOfGuests || 1,
        totalAmount: row.totalPrice,
        formattedPrice: formatInr.format(row.totalPrice),
      };
    });
  }

  static async getBookingById(id) {
    const [rows] = await getDatabase()
      .collection("bookings")
      .aggregate([
        {
          $match: {
            _id: id instanceof ObjectId ? id : new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "homes",
            let: {
              homeObjectId: {
                $convert: {
                  input: "$homeId",
                  to: "objectId",
                  onError: null,
                  onNull: null,
                },
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$homeObjectId"],
                  },
                },
              },
            ],
            as: "home_details",
          },
        },
      ])
      .toArray();

    if (!rows || rows.length === 0) return null;

    const b = rows;
    const nights =
      b.checkIn && b.checkOut
        ? Math.max(
            1,
            Math.round((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000),
          )
        : 1;
    const paidNightly = Math.round(
      (b.totalPrice - CLEANING_FEE - SERVICE_FEE) / nights,
    );
    const nightlyRate = paidNightly > 0 ? paidNightly : b.price || 0;
    const paymentLabels = {
      upi: "UPI",
      card: "Card",
      arrival: "Pay at arrival",
    };
    const money = (n) => formatInr.format(n || 0);

    return {
      homeName: b.home_details?.[0]?.name,
      location: b.home_details?.[0]?.location,
      photo: b.home_details?.[0]?.url,
      price: b.home_details?.[0]?.price,
      nights,
      bookingId: b._id,
      homeId: b.homeId,
      fullName: b.fullName,
      email: b.email,
      phoneNumber: b.phoneNumber,
      checkIn: b.checkIn ? new Date(b.checkIn).toISOString().split("T")[0] : "",
      checkOut: b.checkOut
        ? new Date(b.checkOut).toISOString().split("T")[0]
        : "",
      numberOfGuests: b.numberOfGuests,
      totalAmount: b.totalPrice,
      formattedTotal: money(b.totalPrice),
      formattedNightlyRate: money(nightlyRate),
      formattedNightsTotal: money(nightlyRate * nights),
      formattedCleaningFee: money(CLEANING_FEE),
      formattedServiceFee: money(SERVICE_FEE),
      paymentMethod: b.paymentMethod,
      paymentMethodLabel: paymentLabels[b.paymentMethod] || b.paymentMethod,
    };
  }
}

Reserve.CLEANING_FEE = CLEANING_FEE;
Reserve.SERVICE_FEE = SERVICE_FEE;

module.exports = Reserve;
