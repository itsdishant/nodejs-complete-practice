const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/userModel");
const Home = require("../models/homeModel");

const cover = (file) => `https://a0.muscache.com/im/pictures/${file}?im_w=1200`;

const hosts = [
  {
    fullName: "Asha Matty",
    email: "asha.matty@example.com",
    password: "asha123",
  },
  {
    fullName: "Rohan Deshpande",
    email: "rohan.deshpande@example.com",
    password: "rohan123",
  },
  {
    fullName: "Meera Krishnan",
    email: "meera.krishnan@example.com",
    password: "meera123",
  },
  {
    fullName: "Aditya Rathore",
    email: "aditya.rathore@example.com",
    password: "aditya123",
  },
  {
    fullName: "Priya Nambiar",
    email: "priya.nambiar@example.com",
    password: "priya123",
  },
  {
    fullName: "Wayan Sukarta",
    email: "wayan.sukarta@example.com",
    password: "wayan123",
  },
  {
    fullName: "Camille Laurent",
    email: "camille.laurent@example.com",
    password: "camille123",
  },
];

const homes = [
  // ------------------------------------------------------ Asha Matty (Goa)
  {
    host: "asha.matty@example.com",
    name: "Gem'inius | 1BHK| No. Thalassa Anjuna Vagator Beach",
    location: "Siolim, Goa",
    price: 1746,
    roomId: "1275194978575082490",
    url: cover(
      "hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI3NTE5NDk3ODU3NTA4MjQ5MA%3D%3D/original/31fdb39e-fa97-4607-bd86-7482c0c1b2fe.jpeg",
    ),
  },
  {
    host: "asha.matty@example.com",
    name: "C 101 by Alira Stays | 1Bhk | Near Candolim | Pool",
    location: "Nerul, Goa",
    price: 3500,
    roomId: "1633947258598069394",
    url: cover(
      "airflow/Hosting-1633947258598069394/original/83dc4976-3456-4b53-aba9-0c9a4967f08a.jpg",
    ),
  },
  {
    host: "asha.matty@example.com",
    name: "Avtara | Stylish 1BR Getaway in Calangute",
    location: "Calangute, Goa",
    price: 4455,
    roomId: "1764962579911287578",
    url: cover(
      "hosting/Hosting-1764962579911287578/original/4828520c-fb77-4405-92bc-4bb3d916b68e.jpeg",
    ),
  },
  {
    host: "asha.matty@example.com",
    name: "Quinta Da Santana Luxury Villa : In-house kitchen",
    location: "Raia, Goa",
    price: 5450,
    roomId: "657011800148868945",
    url: cover(
      "miso/Hosting-657011800148868945/original/d98481cd-55d7-430b-96f5-08d673ec8d92.jpeg",
    ),
  },
  {
    host: "asha.matty@example.com",
    name: "Cleo Luxury Stays-1BHK With Pool , Baga ,North Goa",
    location: "Arpora, Goa",
    price: 6000,
    roomId: "1290062443174374003",
    url: cover(
      "miso/Hosting-1290062443174374003/original/51e81f69-a9d8-4844-acd6-2f35b2a5acfa.jpeg",
    ),
  },
  {
    host: "asha.matty@example.com",
    name: "Luxury 1BHK with Private Plunge Pool In North Goa",
    location: "Reis Magos, Goa",
    price: 11250,
    roomId: "1736794935761604394",
    url: cover(
      "hosting/Hosting-1736794935761604394/original/11a0ef78-b660-4167-bbb1-b7d693f19dde.png",
    ),
  },

  // ------------------------------------------------- Rohan Deshpande (Rajasthan)
  {
    host: "rohan.deshpande@example.com",
    name: "Friendly & Peaceful En-suite 'Jewel of Jaisalmer'",
    location: "Jaisalmer, Rajasthan",
    price: 1181,
    roomId: "12060540",
    url: cover("ddece8d0-3f45-46a4-8c76-9a4cb88a97bc.jpg"),
  },
  {
    host: "rohan.deshpande@example.com",
    name: "Ambey G1 | Stylish Studio near WTP & Airport",
    location: "Jaipur, Rajasthan",
    price: 1750,
    roomId: "1665648288104560510",
    url: cover(
      "hosting/Hosting-1665648288104560510/original/2d0d74ba-d911-4832-9ef9-5f01a55746ab.png",
    ),
  },
  {
    host: "rohan.deshpande@example.com",
    name: "The Little Basera | 1BHK in City Center",
    location: "Udaipur, Rajasthan",
    price: 2993,
    roomId: "1781877558364436265",
    url: cover(
      "hosting/Hosting-1781877558364436265/original/6afb6815-2d26-4eb8-80a8-2b9a26c3e5ba.jpeg",
    ),
  },
  {
    host: "rohan.deshpande@example.com",
    name: "Pathiyal",
    location: "Jaisalmer, Rajasthan",
    price: 3200,
    roomId: "790469817161526513",
    url: cover(
      "hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6NzkwNDY5ODE3MTYxNTI2NTEz/original/0be90d2e-5037-4f7c-a840-1a8fc5ea55fd.jpeg",
    ),
  },
  {
    host: "rohan.deshpande@example.com",
    name: "Mango Abode : Home with Breakfast and Pickup",
    location: "Udaipur, Rajasthan",
    price: 4095,
    roomId: "1702646748044370712",
    url: cover(
      "hosting/Hosting-1702646748044370712/original/f6db4823-15c7-4d10-a6c6-ea0e781f0b85.jpeg",
    ),
  },
  {
    host: "rohan.deshpande@example.com",
    name: "Maharaja | Grand Heritage Penthouse with Terrace",
    location: "Jaipur, Rajasthan",
    price: 6948,
    roomId: "1760780337560210852",
    url: cover(
      "hosting/Hosting-1760780337560210852/original/d1b6b0b7-ccc9-41e7-bcab-83215db43b6c.png",
    ),
  },

  // -------------------------------------------------- Meera Krishnan (Kerala + Karnataka)
  {
    host: "meera.krishnan@example.com",
    name: "Temple Tree Family Homestay",
    location: "Madikeri, Karnataka",
    price: 2066,
    roomId: "20888822",
    url: cover("4b578ee0-9865-41cc-81ee-6d4643cec149.jpg"),
  },
  {
    host: "meera.krishnan@example.com",
    name: "Garden Villa Room Non AC Side Sea View",
    location: "Alappuzha, Kerala",
    price: 2500,
    roomId: "1725184285826515823",
    url: cover(
      "hosting/Hosting-1725184285826515823/original/a36f93b4-b9e1-461c-a81d-2c328fe20727.jpeg",
    ),
  },
  {
    host: "meera.krishnan@example.com",
    name: "Aida villa luxury stay at Munnar!",
    location: "Anachal, Kerala",
    price: 3086,
    roomId: "930848703401864484",
    url: cover("469a61da-1c15-4d65-a4cc-d111458c45df.jpg"),
  },
  {
    host: "meera.krishnan@example.com",
    name: "Marari Eshban Beach Villa",
    location: "Alappuzha, Kerala",
    price: 5700,
    roomId: "1138182764564829077",
    url: cover(
      "hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTEzODE4Mjc2NDU2NDgyOTA3Nw%3D%3D/original/edd4e7f3-e4de-4ae8-ae98-da2f552099f9.jpeg",
    ),
  },
  {
    host: "meera.krishnan@example.com",
    name: "KaayamKaad -Valley View",
    location: "Madikeri, Karnataka",
    price: 7462,
    roomId: "1051228988453768365",
    url: cover(
      "miso/Hosting-1046238972684068815/original/49bb12f3-9b3d-4949-820b-fa521317b212.jpeg",
    ),
  },
  {
    host: "meera.krishnan@example.com",
    name: "Adobe by The Mudhouse Marayoor",
    location: "Munnar, Kerala",
    price: 12500,
    roomId: "23795589",
    url: cover(
      "miso/Hosting-23795589/original/52c4283c-595c-4e4f-976e-da9767cd7753.jpeg",
    ),
  },

  // -------------------------------------------------- Aditya Rathore (Himachal + Uttarakhand)
  {
    host: "aditya.rathore@example.com",
    name: "Aadesh villa Oak",
    location: "Manali, Himachal Pradesh",
    price: 1099,
    roomId: "1127278832135035434",
    url: cover(
      "hosting/Hosting-1127278832135035434/original/1bb8f926-8a34-4b5a-a03e-66297c325012.jpeg",
    ),
  },
  {
    host: "aditya.rathore@example.com",
    name: "Tranquil Stay at Himalayan Height",
    location: "Manali, Himachal Pradesh",
    price: 1500,
    roomId: "650350723684946438",
    url: cover(
      "miso/Hosting-650350723684946438/original/049cd2f0-50f8-422d-b266-7cc1533d2095.jpeg",
    ),
  },
  {
    host: "aditya.rathore@example.com",
    name: "A Beautiful Cottage Mountain View Balcony & Lawn",
    location: "Manali, Himachal Pradesh",
    price: 2000,
    roomId: "1619385299119397410",
    url: cover(
      "hosting/Hosting-1619385299119397410/original/555fc055-ab60-4771-ab7d-cb1051c936ee.png",
    ),
  },
  {
    host: "aditya.rathore@example.com",
    name: "Indian Culture Hostel",
    location: "Rishikesh, Uttarakhand",
    price: 3420,
    roomId: "1049204261820247434",
    url: cover(
      "hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTA0OTIwNDI2MTgyMDI0NzQzNA%3D%3D/original/ffa8f209-b06d-4d34-9f73-90b5f49b6066.jpeg",
    ),
  },
  {
    host: "aditya.rathore@example.com",
    name: "Michelintaara's Desk",
    location: "Nasogi, Himachal Pradesh",
    price: 3500,
    roomId: "1526631037626578246",
    url: cover(
      "hosting/Hosting-1526631037626578246/original/bf1315a2-8534-4e16-a1e1-f5dd7efe56a2.png",
    ),
  },
  {
    host: "aditya.rathore@example.com",
    name: "Luxury Studio Apartment with Ganga View",
    location: "Rishikesh, Uttarakhand",
    price: 6195,
    roomId: "1110041048351966712",
    url: cover(
      "miso/Hosting-1110041048351966712/original/41532528-bdd8-42f2-a928-23df82a78037.jpeg",
    ),
  },

  // --------------------------------------------------- Priya Nambiar (Uttar Pradesh + Bengal + Goa)
  {
    host: "priya.nambiar@example.com",
    name: "Feel At Home (Entire Apartment).",
    location: "Darjeeling, West Bengal",
    price: 1300,
    roomId: "9403847",
    url: cover("38dee75e-14c5-49a0-9158-fb166cdc9857.jpg"),
  },
  {
    host: "priya.nambiar@example.com",
    name: "15 Min Walk to Assi Ghat | Calm & Peaceful Stay",
    location: "Varanasi, Uttar Pradesh",
    price: 1310,
    roomId: "1043997294384824691",
    url: cover(
      "hosting/Hosting-1043997294384824691/original/fa81e5f0-9d94-4e6f-bed4-19e5b04b0c42.png",
    ),
  },
  {
    host: "priya.nambiar@example.com",
    name: "Garden View:-A Peaceful Retreat",
    location: "Varanasi, Uttar Pradesh",
    price: 1949,
    roomId: "1239752677356421889",
    url: cover(
      "hosting/Hosting-1239752677356421889/original/2fb33674-20b6-4cd6-9a44-0bbdd3b2efd8.jpeg",
    ),
  },
  {
    host: "priya.nambiar@example.com",
    name: "Serenities Home",
    location: "Darjeeling, West Bengal",
    price: 3200,
    roomId: "1258568110015091244",
    url: cover(
      "hosting/Hosting-1258568110015091244/original/6e38b4d9-1526-4be9-ac60-1e6125e5175a.jpeg",
    ),
  },
  {
    host: "priya.nambiar@example.com",
    name: "Pinterest-Style stay | Walk to Kashi Vishwanath",
    location: "Varanasi, Uttar Pradesh",
    price: 5396,
    roomId: "1519378626673909662",
    url: cover(
      "hosting/Hosting-1519378626673909662/original/1468e69a-c8e3-4a10-8fc5-b00174c1b76c.jpeg",
    ),
  },
  {
    host: "priya.nambiar@example.com",
    name: "Peace Lily/Froggy Bohemia- 1 bhk w/ jacuzzi",
    location: "Siolim, Goa",
    price: 5738,
    roomId: "1287020336525204076",
    url: cover(
      "miso/Hosting-1287020336525204076/original/ac398611-761c-4177-8832-cf6e780b4ecc.jpeg",
    ),
  },

  // --------------------------------------------------- Wayan Sukarta (Bali + Phuket + Kyoto)
  {
    host: "wayan.sukarta@example.com",
    name: "Cheap House in Ubud with Big Pool",
    location: "Gianyar, Bali, Indonesia",
    price: 2142,
    roomId: "32428942",
    url: cover("e17d56c9-c9d5-4ab0-871a-d27131548a67.jpg"),
  },
  {
    host: "wayan.sukarta@example.com",
    name: "Chang Apartment Phuket Town",
    location: "Phuket Town, Phuket, Thailand",
    price: 2913,
    roomId: "1462079735519553660",
    url: cover(
      "hosting/Hosting-1462079735519553660/original/e6cd2e9b-1934-40e7-b1f5-7067c3c56e01.jpeg",
    ),
  },
  {
    host: "wayan.sukarta@example.com",
    name: "Family-Run Guesthouse in Kata Beach",
    location: "Kata Beach, Phuket, Thailand",
    price: 4903,
    roomId: "8002497",
    url: cover(
      "miso/Hosting-8002497/original/4ba40f2b-042f-4938-a536-d5919a2530de.jpeg",
    ),
  },
  {
    host: "wayan.sukarta@example.com",
    name: "2 min. from Gojo Station Bed room with Tatami 2F",
    location: "Shimogyo-ku, Kyoto, Japan",
    price: 6554,
    roomId: "19533041",
    url: cover(
      "miso/Hosting-19533041/original/8b82ded5-78c6-403f-88a2-ef75645f7832.jpeg",
    ),
  },
  {
    host: "wayan.sukarta@example.com",
    name: "Kujaku",
    location: "Kyoto, Japan",
    price: 9368,
    roomId: "942513010757625336",
    url: cover(
      "miso/Hosting-942513010757625336/original/96d1b5ca-9541-410d-8bfe-09bc3758d32e.jpeg",
    ),
  },
  {
    host: "wayan.sukarta@example.com",
    name: "Special Offer | 1BR Private Pool Bamboo",
    location: "Ubud, Bali, Indonesia",
    price: 12043,
    roomId: "1612275833390604551",
    url: cover(
      "hosting/Hosting-1612275833390604551/original/940f7c00-8c46-43f0-9d9d-9fb3efeff096.jpeg",
    ),
  },

  // ------------------------------------------------- Camille Laurent (Portugal + Greece + Italy)
  {
    host: "camille.laurent@example.com",
    name: "Top-floor Smart Studio | AC & balcony",
    location: "Lisbon, Portugal",
    price: 6671,
    roomId: "1711541474016310477",
    url: cover(
      "hosting/Hosting-1711541474016310477/original/1b3b6fb9-cbbb-4707-8a13-0a357938e2df.png",
    ),
  },
  {
    host: "camille.laurent@example.com",
    name: "Giglio Blu Charming Loft Wine & Hills",
    location: "Carmignano, Tuscany, Italy",
    price: 9688,
    roomId: "867202984992847172",
    url: cover(
      "hosting/Hosting-867202984992847172/original/4d6e6e0f-1128-468a-8c26-805bd810e6c0.jpeg",
    ),
  },
  {
    host: "camille.laurent@example.com",
    name: "Vacay Suites Queen Suite with Caldera View",
    location: "Fira, Santorini, Greece",
    price: 11965,
    roomId: "608647583395942329",
    url: cover(
      "miso/Hosting-608647583395942329/original/522662ea-0bd0-41f9-9edc-50ebca2d5469.jpeg",
    ),
  },
  {
    host: "camille.laurent@example.com",
    name: "Luxurious Apartment in Downtown Lisbon",
    location: "Lisbon, Portugal",
    price: 12865,
    roomId: "1216692690645506466",
    url: cover(
      "prohost-api/Hosting-1216692690645506466/original/eb8c141c-0e2d-45a9-81a9-5867270e3be7.jpeg",
    ),
  },
  {
    host: "camille.laurent@example.com",
    name: "Esmi Cave Suite Caldera Sunset & Heated Jacuzzi",
    location: "Merovígli, Santorini, Greece",
    price: 13235,
    roomId: "1672772244948150239",
    url: cover(
      "hosting/Hosting-1672772244948150239/original/f6627922-25a1-449a-b99e-54238c46c83e.png",
    ),
  },
  {
    host: "camille.laurent@example.com",
    name: "Peaceful Tuscan Home Among Green Countryside View",
    location: "Barberino Tavarnelle, Tuscany, Italy",
    price: 23558,
    roomId: "1486089282126756297",
    url: cover(
      "hosting/Hosting-1486089282126756297/original/2e606368-7475-4afa-944d-bfc6c4535d30.jpeg",
    ),
  },
];
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "airbnb-prod" });

  const byEmail = new Map();
  let hostsCreated = 0;

  for (const host of hosts) {
    let user = await User.findOne({ email: host.email });
    if (!user) {
      user = await User.create({
        fullName: host.fullName,
        email: host.email,
        password: host.password,
        role: "host",
      });
      hostsCreated++;
      console.log(`  + host  ${host.fullName} <${host.email}>`);
    } else {
      console.log(
        `  = host  ${host.fullName} <${host.email}> (already exists)`,
      );
    }
    byEmail.set(host.email, user);
  }

  let homesCreated = 0;
  for (const home of homes) {
    const host = byEmail.get(home.host);
    if (!host) throw new Error(`Unknown host ${home.host}`);

    const existing = await Home.findOne({ hostId: host._id, name: home.name });
    if (existing) continue;

    await Home.create({
      hostId: host._id,
      name: home.name,
      location: home.location,
      price: home.price,
      url: home.url,
    });
    homesCreated++;
  }

  console.log(`\nhosts created: ${hostsCreated}/${hosts.length}`);
  console.log(`homes created: ${homesCreated}/${homes.length}`);

  // Final state per host, read back from the database.
  console.log("\nhost                 homes  price range");
  for (const host of hosts) {
    const user = byEmail.get(host.email);
    const own = await Home.find({ hostId: user._id }).sort({ price: 1 }).lean();
    const low = own.length ? own[0].price : 0;
    const high = own.length ? own[own.length - 1].price : 0;
    console.log(
      `${host.fullName.padEnd(20)} ${String(own.length).padStart(5)}  ₹${low.toLocaleString("en-IN")} – ₹${high.toLocaleString("en-IN")}`,
    );
  }

  const all = await Home.find().lean();
  const destinations = [...new Set(all.map((h) => h.location))].sort();
  const cheapest = all.reduce((a, b) => (a.price <= b.price ? a : b));
  const dearest = all.reduce((a, b) => (a.price >= b.price ? a : b));
  console.log(`\ntotal homes in database: ${all.length}`);
  console.log(
    `locations (${destinations.length}): ${destinations.join(" | ")}`,
  );
  console.log(
    `price range: ₹${cheapest.price.toLocaleString("en-IN")} (${cheapest.location}) – ₹${dearest.price.toLocaleString("en-IN")} (${dearest.location})`,
  );

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
