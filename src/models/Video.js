import mongoose from "mongoose";

export const CATEGORIES = ["Gaming", "Music", "Cooking", "Coding", "Cricket", "Vlog"];

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: "", maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: true },
    emoji: { type: String, default: "🎬" },
    c1: { type: String, default: "#7B5CFF" },
    c2: { type: String, default: "#FF3D81" },
    duration: { type: Number, required: true, min: 1 }, // seconds
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

videoSchema.index({ category: 1, createdAt: -1 });
videoSchema.index({ views: -1 });

export default mongoose.model("Video", videoSchema);
