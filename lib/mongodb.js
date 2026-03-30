import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  // cached.promise = cached.promise || mongoose.connect(process.env.MONGODB_URI);
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.DB_NAME || "fade-book-app",
      
    });
  }
  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn;
}

export default connectDB;