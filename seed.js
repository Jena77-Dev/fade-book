const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'barbershop_db';

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);

    // const db = client.db(); // uses DB from URI

    // Clear database
    await db.dropDatabase();

    // Services
    // await db.collection("services").insertMany([
    //   { name: "Haircut", description: "Classic haircut & styling", price: 200, duration: 30, category: "hair", isActive: true, createdAt: new Date() },
    //   { name: "Beard Trim", description: "Beard shaping & trim", price: 100, duration: 15, category: "beard", isActive: true, createdAt: new Date() },
    //   { name: "Hair Color", description: "Full hair coloring", price: 500, duration: 60, category: "hair", isActive: true, createdAt: new Date() },
    //   { name: "Facial", description: "Deep cleansing facial", price: 400, duration: 45, category: "skin", isActive: true, createdAt: new Date() },
    //   { name: "Haircut + Beard", description: "Combo package", price: 250, duration: 45, category: "combo", isActive: true, createdAt: new Date() },
    // ]);

    await db.collection("services").insertMany([
      {
        serviceId: "S001",
        name: "Haircut",
        description: "Classic haircut & styling",
        price: 200,
        duration: 30,
        category: "haircut",
        image: "haircut.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        serviceId: "S002",
        name: "Beard Trim",
        description: "Beard shaping & trim",
        price: 100,
        duration: 15,
        category: "beard",
        image: "beard-trim.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        serviceId: "S003",
        name: "Hair Color",
        description: "Full hair coloring",
        price: 500,
        duration: 60,
        category: "hair",
        image: "hair-color.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        serviceId: "S004",
        name: "Facial",
        description: "Deep cleansing facial",
        price: 400,
        duration: 45,
        category: "skin",
        image: "facial.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        serviceId: "S005",
        name: "Haircut + Beard",
        description: "Combo package",
        price: 250,
        duration: 45,
        category: "combo",
        image: "combo.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // 🔥 Additional realistic services
      {
        serviceId: "S006",
        name: "Shaving",
        description: "Clean shave with hot towel",
        price: 120,
        duration: 20,
        category: "beard",
        image: "shaving.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        serviceId: "S007",
        name: "Head Massage",
        description: "Relaxing oil head massage",
        price: 300,
        duration: 30,
        category: "hair",
        image: "head-massage.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        serviceId: "S008",
        name: "Hair Spa",
        description: "Nourishing hair spa treatment",
        price: 600,
        duration: 60,
        category: "hair",
        image: "hair-spa.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        serviceId: "S009",
        name: "Face Cleanup",
        description: "Quick skin cleanup for glowing face",
        price: 250,
        duration: 30,
        category: "skin",
        image: "cleanup.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        serviceId: "S010",
        name: "Premium Grooming Package",
        description: "Haircut + Beard + Facial",
        price: 900,
        duration: 90,
        category: "combo",
        image: "premium-package.jpg",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Barbers
    // await db.collection("barbers").insertMany([
    //   { name: "Raj Kumar", phone: "9876543210", specialties: ["haircut", "styling"], experience: 5, isAvailable: true, isActive: true, workingHours: { start: "09:00", end: "21:00" }, createdAt: new Date() },
    //   { name: "Amit Singh", phone: "9876543211", specialties: ["beard", "coloring"], experience: 3, isAvailable: true, isActive: true, workingHours: { start: "10:00", end: "20:00" }, createdAt: new Date() },
    //   { name: "Vikram Patel", phone: "9876543212", specialties: ["haircut", "facial"], experience: 7, isAvailable: true, isActive: true, workingHours: { start: "09:00", end: "21:00" }, createdAt: new Date() },
    // ]);

    await db.collection("barbers").insertMany([
      { barberId: "B001", name: "Raj Kumar", specialty: "haircut, styling", experience: 5, phone: "9876543210", rating: 4.5, totalBookings: 120, isAvailable: true, active: true, workingHours: { start: "09:00", end: "21:00" }, createdAt: new Date(), updatedAt: new Date(), },
      { barberId: "B002", name: "Amit Singh", specialty: "beard, coloring", experience: 3, phone: "9876543211", rating: 4.2, totalBookings: 80, isAvailable: true, active: true, workingHours: { start: "10:00", end: "20:00" }, createdAt: new Date(), updatedAt: new Date(), },
      { barberId: "B003", name: "Vikram Patel", specialty: "haircut, facial", experience: 7, phone: "9876543212", rating: 4.7, totalBookings: 200, isAvailable: true, active: true, workingHours: { start: "09:00", end: "21:00" }, createdAt: new Date(), updatedAt: new Date(), },
    ]);

    // Settings
    await db.collection("settings").insertOne({
      settingsType: "shop",
      shopName: "Royal Men's Salon",
      phone: "9876543200",
      email: "abc@fadebook.com",
      address: "123, MG Road, Bangalore",
      openTime: "09:00",
      closeTime: "21:00",
      slotDuration: 30,
      closedDays: ["Monday"],
      createdAt: new Date(),
    });

    console.log("Seed data inserted!");
  } catch (err) {
    console.error("Error seeding:", err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();