require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const db = require("../models"); // Ensure this path points to your models/index.js

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

// --- Constants & Data ---

const INDIAN_USERS = [
  ["Aarav Patel", "aarav.patel"],
  ["Vivaan Singh", "vivaan.singh"],
  ["Aditya Sharma", "aditya.sharma"],
  ["Vihaan Gupta", "vihaan.gupta"],
  ["Arjun Kumar", "arjun.kumar"],
  ["Sai Iyer", "sai.iyer"],
  ["Reyansh Reddy", "reyansh.reddy"],
  ["Krishna Menon", "krishna.menon"],
  ["Ishaan Nair", "ishaan.nair"],
  ["Shaurya Verma", "shaurya.verma"],
];

const TRAVEL_DESTINATIONS = [
  {
    location: "Jaipur, Rajasthan",
    titles: ["The Pink City Adventure", "Royalty at Hawa Mahal", "Sunset at Nahargarh Fort"],
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000",
    desc: "Explored the magnificent forts and palaces. The local food was spicy and delicious. Hawa Mahal looked stunning in the morning light."
  },
  {
    location: "Goa, India",
    titles: ["Beach Vibes Only", "Relaxing at Palolem", "Goa Sunsets"],
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000",
    desc: "Spent the weekend chilling by the beach. The seafood was fresh, and the evening breeze was perfect. Highly recommend renting a scooter to explore."
  },
  {
    location: "Manali, Himachal Pradesh",
    titles: ["Snowy Escapades", "Trekking in the Himalayas", "Manali Diaries"],
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1000",
    desc: "The mountains were calling! Experience the fresh mountain air and the breathtaking views of the snow-capped peaks. Solang Valley was a highlight."
  },
  {
    location: "Kerala, India",
    titles: ["Backwaters Bliss", "Houseboat Stay", "God's Own Country"],
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1000",
    desc: "Cruising through the backwaters of Alleppey was serene. The greenery is unmatched. Enjoyed authentic Kerala sadhya on a banana leaf."
  },
  {
    location: "Kyoto, Japan",
    titles: ["Cherry Blossoms in Spring", "Temple Run in Kyoto", "Japanese Zen"],
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000",
    desc: "Walked through the Fushimi Inari shrine. The torii gates seem endless. The city mixes tradition and modernity perfectly."
  },
  {
    location: "Paris, France",
    titles: ["Eiffel Tower at Night", "Louvre Museum Visit", "Parisian Cafes"],
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000",
    desc: "The city of love lived up to its name. Saw the Mona Lisa and enjoyed croissants at a street-side cafe. The architecture is stunning."
  },
  {
    location: "Bali, Indonesia",
    titles: ["Ubud Rice Terraces", "Island Hopping", "Bali Spiritual Retreat"],
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000",
    desc: "Bali is a tropical paradise. The rice terraces in Ubud are lush green. Great place for yoga and meditation."
  }
];

const SEED_PASSWORD = "password123";

// --- Helpers ---

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// --- Main Seed Function ---

async function seed() {
  try {
    // 1. Connect to Database
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME || undefined });
    console.log("Connected to MongoDB");

    const { user: User, travelLog: TravelLog } = db;

    // 2. Clear existing data
    await TravelLog.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing users and travel logs");

    // 3. Create Users
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 12);
    
    const userDocs = INDIAN_USERS.map(([name, prefix]) => ({
      name,
      email: `${prefix}@example.com`,
      password: hashedPassword,
    }));

    const createdUsers = await User.insertMany(userDocs);
    console.log(`Created ${createdUsers.length} users`);

    // 4. Create Travel Logs
    const travelLogDocs = [];

    // Loop through each user and assign 2-5 random trips
    createdUsers.forEach((user) => {
      const numberOfTrips = Math.floor(Math.random() * 4) + 2; // Random 2 to 5 trips

      for (let i = 0; i < numberOfTrips; i++) {
        const destination = pick(TRAVEL_DESTINATIONS);
        const tripDate = randomDate(new Date(2023, 0, 1), new Date()); // Random date in last ~2 years
        
        travelLogDocs.push({
          user: user._id,
          title: pick(destination.titles),
          location: destination.location,
          description: destination.desc,
          travelDate: tripDate,
          imageUrl: destination.image,
        });
      }
    });

    await TravelLog.insertMany(travelLogDocs);
    console.log(`Created ${travelLogDocs.length} travel logs`);

    // 5. Success Message
    console.log("\n--- Seed Complete ---");
    console.log(`Sample Login: ${INDIAN_USERS[0][1]}@example.com`);
    console.log(`Password: ${SEED_PASSWORD}`);

  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    // 6. Disconnect
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();