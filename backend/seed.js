// seed.js
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

// --- Constants & Data ---

const INDIAN_EMPLOYEES = [
  ["Aarav Patel", "aarav.patel", "Engineering"],
  ["Vivaan Singh", "vivaan.singh", "Sales"],
  ["Aditya Sharma", "aditya.sharma", "Engineering"],
  ["Vihaan Gupta", "vihaan.gupta", "Marketing"],
  ["Arjun Kumar", "arjun.kumar", "HR"],
  ["Sai Iyer", "sai.iyer", "Engineering"],
  ["Reyansh Reddy", "reyansh.reddy", "Finance"],
  ["Krishna Menon", "krishna.menon", "Operations"],
  ["Ishaan Nair", "ishaan.nair", "Engineering"],
  ["Shaurya Verma", "shaurya.verma", "Sales"],
  ["Diya Kapoor", "diya.kapoor", "HR"],
  ["Ananya Desai", "ananya.desai", "Marketing"],
];

const ADMIN_USER = ["Sanjay Kumar", "sanjay.kumar@company.com", "Management"];

const LEAVE_TYPES = ["Casual", "Sick", "Paid", "Other"];

const LEAVE_REASONS = {
  Casual: [
    "Family function in hometown",
    "Personal work",
    "Attending a wedding",
    "Home renovation work",
    "Taking care of family matters",
    "Festival celebrations with family",
    "Visiting relatives",
  ],
  Sick: [
    "Fever and cold",
    "Medical checkup",
    "Doctor's appointment",
    "Recovering from illness",
    "Health issues",
    "Viral infection",
    "Dental treatment",
  ],
  Paid: [
    "Family vacation to Goa",
    "Trip to Kerala backwaters",
    "Visiting Manali with family",
    "Going to Jaipur for tourism",
    "Beach vacation",
    "Hill station trip",
    "Annual family vacation",
  ],
  Other: [
    "Moving to new apartment",
    "Passport renewal work",
    "Bank and official paperwork",
    "Vehicle registration",
    "Legal documentation work",
  ],
};

const ADMIN_NOTES = {
  Approved: [
    "Approved. Enjoy your time off.",
    "Leave granted. Have a good break.",
    "Approved as requested.",
    "",
  ],
  Rejected: [
    "Sorry, we are short-staffed during this period.",
    "Please reschedule. Critical project deadline approaching.",
    "Unable to approve due to team availability issues.",
  ],
};

const SEED_PASSWORD = "password123";

// --- Helpers ---

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// --- Main Seed Function ---

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    // 1. Connect to Database
    await client.connect();
    const db = client.db(DB_NAME);
    console.log("Connected to MongoDB");

    const users = db.collection("users");
    const leaves = db.collection("leaves");

    // 2. Clear existing data
    await leaves.deleteMany({});
    await users.deleteMany({});
    console.log("Cleared existing users and leaves");

    // 3. Create Admin User
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
    
    const adminUser = {
      name: ADMIN_USER[0],
      email: ADMIN_USER[1],
      password: hashedPassword,
      department: ADMIN_USER[2],
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const adminResult = await users.insertOne(adminUser);
    console.log(`Created admin user: ${ADMIN_USER[1]}`);

    // 4. Create Employee Users
    const employeeUsers = INDIAN_EMPLOYEES.map(([name, prefix, department]) => ({
      name,
      email: `${prefix}@company.com`,
      password: hashedPassword,
      department,
      role: "employee",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const employeeResults = await users.insertMany(employeeUsers);
    const createdEmployees = await users
      .find({ _id: { $in: Object.values(employeeResults.insertedIds) } })
      .toArray();
    console.log(`Created ${createdEmployees.length} employee users`);

    // 5. Create Leave Applications
    const leaveApplications = [];
    const statuses = ["Approved", "Pending", "Rejected"];
    const statusWeights = [0.5, 0.3, 0.2]; // 50% approved, 30% pending, 20% rejected

    // Create leaves for each employee
    createdEmployees.forEach((user) => {
      const numberOfLeaves = Math.floor(Math.random() * 6) + 3; // 3 to 8 leaves per user

      for (let i = 0; i < numberOfLeaves; i++) {
        const leaveType = pick(LEAVE_TYPES);
        const reason = pick(LEAVE_REASONS[leaveType]);
        
        // Determine status based on weights
        const rand = Math.random();
        let status;
        if (rand < statusWeights[0]) {
          status = "Approved";
        } else if (rand < statusWeights[0] + statusWeights[1]) {
          status = "Pending";
        } else {
          status = "Rejected";
        }

        // Generate dates
        // Mix of past and future dates
        const isPast = Math.random() > 0.3; // 70% past, 30% future
        
        let fromDate;
        if (isPast) {
          // Past dates: between 6 months ago and today
          fromDate = randomDate(
            new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            new Date()
          );
        } else {
          // Future dates: between today and 3 months ahead
          fromDate = randomDate(
            new Date(),
            new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          );
        }

        // Duration: 1 to 7 days
        const duration = Math.floor(Math.random() * 7) + 1;
        const toDate = addDays(fromDate, duration - 1);

        // Pending leaves should be future dates
        if (status === "Pending") {
          fromDate = randomDate(
            new Date(),
            new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
          );
          const pendingDuration = Math.floor(Math.random() * 5) + 1;
          const pendingToDate = addDays(fromDate, pendingDuration - 1);
          
          leaveApplications.push({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            userDepartment: user.department,
            leaveType,
            fromDate,
            toDate: pendingToDate,
            reason,
            status: "Pending",
            adminNote: "",
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Created in last 7 days
            updatedAt: new Date(),
          });
        } else {
          leaveApplications.push({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            userDepartment: user.department,
            leaveType,
            fromDate,
            toDate,
            reason,
            status,
            adminNote: pick(ADMIN_NOTES[status]),
            createdAt: randomDate(
              new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
              new Date()
            ),
            updatedAt: new Date(),
          });
        }
      }
    });

    await leaves.insertMany(leaveApplications);
    console.log(`Created ${leaveApplications.length} leave applications`);

    // 6. Statistics
    const approvedCount = leaveApplications.filter(l => l.status === "Approved").length;
    const pendingCount = leaveApplications.filter(l => l.status === "Pending").length;
    const rejectedCount = leaveApplications.filter(l => l.status === "Rejected").length;

    console.log("\n--- Seed Complete ---");
    console.log(`\n📊 Statistics:`);
    console.log(`   Total Users: ${createdEmployees.length + 1} (${createdEmployees.length} employees + 1 admin)`);
    console.log(`   Total Leaves: ${leaveApplications.length}`);
    console.log(`   ✅ Approved: ${approvedCount}`);
    console.log(`   ⏳ Pending: ${pendingCount}`);
    console.log(`   ❌ Rejected: ${rejectedCount}`);
    
    console.log(`\n🔐 Login Credentials:`);
    console.log(`   Admin: ${ADMIN_USER[1]}`);
    console.log(`   Password: ${SEED_PASSWORD}`);
    console.log(`\n   Employee: ${employeeUsers[0].email}`);
    console.log(`   Password: ${SEED_PASSWORD}`);

  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    // 7. Disconnect
    await client.close();
    console.log("\nDisconnected from MongoDB");
    process.exit(0);
  }
}

seed();