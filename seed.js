const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await mongoose.connection.db.dropDatabase();

  // Services
  const services = await mongoose.connection.db.collection("services").insertMany([
    { name: "Haircut", description: "Classic haircut & styling", price: 200, duration: 30, category: "hair", isActive: true, createdAt: new Date() },
    { name: "Beard Trim", description: "Beard shaping & trim", price: 100, duration: 15, category: "beard", isActive: true, createdAt: new Date() },
    { name: "Hair Color", description: "Full hair coloring", price: 500, duration: 60, category: "hair", isActive: true, createdAt: new Date() },
    { name: "Facial", description: "Deep cleansing facial", price: 400, duration: 45, category: "skin", isActive: true, createdAt: new Date() },
    { name: "Haircut + Beard", description: "Combo package", price: 250, duration: 45, category: "combo", isActive: true, createdAt: new Date() },
  ]);

  // Barbers
  await mongoose.connection.db.collection("barbers").insertMany([
    { name: "Raj Kumar", phone: "9876543210", specialties: ["haircut", "styling"], experience: 5, isAvailable: true, workingHours: { start: "09:00", end: "21:00" }, createdAt: new Date() },
    { name: "Amit Singh", phone: "9876543211", specialties: ["beard", "coloring"], experience: 3, isAvailable: true, workingHours: { start: "10:00", end: "20:00" }, createdAt: new Date() },
    { name: "Vikram Patel", phone: "9876543212", specialties: ["haircut", "facial"], experience: 7, isAvailable: true, workingHours: { start: "09:00", end: "21:00" }, createdAt: new Date() },
  ]);

  // Settings
  await mongoose.connection.db.collection("settings").insertOne({
    shopName: "Royal Men's Salon",
    phone: "9876543200",
    address: "123, MG Road, Bangalore",
    openTime: "09:00",
    closeTime: "21:00",
    slotDuration: 30,
    closedDays: ["Monday"],
    createdAt: new Date(),
  });

  console.log("Seed data inserted!");
  process.exit(0);
}

seed().catch(console.error);