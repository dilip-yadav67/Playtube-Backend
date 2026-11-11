import { Router } from "express";
import mongoose from "mongoose";
import Video, { CATEGORIES } from "../models/Video.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { videoDTO, escapeRegex } from "../utils/serialize.js";

const router = Router();

router.param("id", (_req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Video id galat hai." })
);

const withChannel = (q) => q.populate("channel", "name");

// GET /api/videos?cat=Gaming&q=react&sort=popular&page=1&limit=12
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { cat, q, sort = "new" } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

    const filter = {};
    if (cat && cat !== "Sab") filter.category = String(cat);
    if (q) {
      const rx = new RegExp(escapeRegex(String(q)), "i");
      const owners = await User.find({ name: rx }).select("_id");
      filter.$or = [{ title: rx }, { channel: { $in: owners.map((u) => u._id) } }];
    }

    const sortBy = sort === "popular" ? { views: -1 } : { createdAt: -1 };
    const [items, total] = await Promise.all([
      withChannel(Video.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit)),
      Video.countDocuments(filter),
    ]);

    res.json({
      items: items.map((v) => videoDTO(v, req.user?._id)),
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  })
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const video = await withChannel(Video.findById(req.params.id));
    if (!video) return res.status(404).json({ message: "Video nahi mila." });
    res.json(videoDTO(video, req.user?._id));
  })
);

// Watch page khulne par ek baar call karo
router.post(
  "/:id/view",
  asyncHandler(async (req, res) => {
    const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!video) return res.status(404).json({ message: "Video nahi mila." });
    res.json({ views: video.views });
  })
);

router.get(
  "/:id/related",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video nahi mila." });

    const same = await withChannel(
      Video.find({ _id: { $ne: video._id }, category: video.category }).sort({ views: -1 }).limit(6)
    );
    let items = same;
    if (items.length < 6) {
      const others = await withChannel(
        Video.find({ _id: { $nin: [video._id, ...same.map((s) => s._id)] } })
          .sort({ views: -1 })
          .limit(6 - items.length)
      );
      items = items.concat(others);
    }
    res.json(items.map((v) => videoDTO(v, req.user?._id)));
  })
);

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { title, description, category, emoji, c1, c2, duration } = req.body || {};
    if (!CATEGORIES.includes(category))
      return res.status(400).json({ message: `Category yeh mein se ho: ${CATEGORIES.join(", ")}` });
    const video = await Video.create({
      title, description, category, emoji, c1, c2,
      duration: Number(duration),
      channel: req.user._id,
    });
    await video.populate("channel", "name");
    res.status(201).json(videoDTO(video, req.user._id));
  })
);

async function ownVideo(req, res) {
  const video = await Video.findById(req.params.id);
  if (!video) {
    res.status(404).json({ message: "Video nahi mila." });
    return null;
  }
  if (String(video.channel) !== String(req.user._id)) {
    res.status(403).json({ message: "Yeh video aapka nahi hai." });
    return null;
  }
  return video;
}

router.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const video = await ownVideo(req, res);
    if (!video) return;
    for (const k of ["title", "description", "category", "emoji", "c1", "c2", "duration"]) {
      if (req.body?.[k] !== undefined) video[k] = req.body[k];
    }
    await video.save();
    await video.populate("channel", "name");
    res.json(videoDTO(video, req.user._id));
  })
);

router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const video = await ownVideo(req, res);
    if (!video) return;
    await Promise.all([video.deleteOne(), Comment.deleteMany({ video: video._id })]);
    res.json({ message: "Video delete ho gaya." });
  })
);

// Like toggle (atomic)
router.post(
  "/:id/like",
  protect,
  asyncHandler(async (req, res) => {
    const uid = req.user._id;
    const already = await Video.exists({ _id: req.params.id, likes: uid });
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      already ? { $pull: { likes: uid } } : { $addToSet: { likes: uid } },
      { new: true }
    );
    if (!video) return res.status(404).json({ message: "Video nahi mila." });
    res.json({ liked: !already, likes: video.likes.length });
  })
);

export default router;
