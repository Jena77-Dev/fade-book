import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  category: { type: String, enum: ["haircut", "beard", "skin", "combo", "hair"], default: "haircut" },
  image: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);