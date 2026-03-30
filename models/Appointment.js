import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false },
  customerId: String,
  barber: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  addOns: [{ id: String, name: String, price: Number}],
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // "10:00", "10:30"
  totalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending", },
  notes: String,
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);