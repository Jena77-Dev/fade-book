import mongoose from "mongoose";

const BarberSchema = new mongoose.Schema({
  barberId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialty: String,
  experience: Number,
  phone: String,
  photo: String,
  rating: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  workingHours: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "21:00" },
  },
}, { timestamps: true });

export default mongoose.models.Barber || mongoose.model("Barber", BarberSchema);