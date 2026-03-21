import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // "10:00", "10:30"
  totalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  notes: String,
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);