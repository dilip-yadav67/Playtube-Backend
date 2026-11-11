import { Router } from "express";
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { commentDTO } from "../utils/serialize.js";

const router = Router();

router.param("id", (_req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Id galat hai." })
);

router.get(
  "/videos/:id/comments",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const filter = { video: req.params.id };

    const [items, total] = await Promise.all([
      Comment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "name"),
      Comment.countDocuments(filter),
    ]);
    res.json({ items: items.map((c) => commentDTO(c, req.user?._id)), total, page, pages: Math.ceil(total / limit) });
  })
);

router.post(
  "/videos/:id/comments",
  protect,
  asyncHandler(async (req, res) => {
    const text = String(req.body?.text || "").trim();
    if (!text) return res.status(400).json({ message: "Comment khaali nahi ho sakta." });
    if (!(await Video.exists({ _id: req.params.id })))
      return res.status(404).json({ message: "Video nahi mila." });

    const comment = await Comment.create({ video: req.params.id, user: req.user._id, text });
    await comment.populate("user", "name");
    res.status(201).json(commentDTO(comment, req.user._id));
  })
);

router.delete(
  "/comments/:id",
  protect,
  asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment nahi mila." });
    if (String(comment.user) !== String(req.user._id))
      return res.status(403).json({ message: "Yeh comment aapka nahi hai." });
    await comment.deleteOne();
    res.json({ message: "Comment delete ho gaya." });
  })
);

export default router;
