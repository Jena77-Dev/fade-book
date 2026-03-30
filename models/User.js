import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ["admin", "barber", "customer"], default: "barber" },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: "Barber" },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);