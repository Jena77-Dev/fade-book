import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
  title: String,
  image: { type: String, required: true },
  category: { type: String, enum: ["haircut", "beard", "styling", "coloring"], default: "haircut" },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: "Barber" },
}, { timestamps: true });

export default mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);