import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  shopName: { type: String, default: "My Salon" },
  phone: String,
  address: String,
  openTime: { type: String, default: "09:00" },
  closeTime: { type: String, default: "21:00" },
  slotDuration: { type: Number, default: 30 }, // minutes
  closedDays: [String], // ["Sunday"]
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);