import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Video from "../models/Video.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.param("id", (_req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : res.status(400).json({ message: "Channel id galat hai." })
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const channel = await User.findById(req.params.id).select("name createdAt");
    if (!channel) return res.status(404).json({ message: "Channel nahi mila." });

    const [subscribers, videos] = await Promise.all([
      User.countDocuments({ subscriptions: channel._id }),
      Video.countDocuments({ channel: channel._id }),
    ]);
    res.json({
      id: channel._id,
      name: channel.name,
      subscribers,
      videos,
      subscribed: req.user ? req.user.subscriptions.some((s) => String(s) === String(channel._id)) : false,
    });
  })
);

// Subscribe / unsubscribe toggle
router.post(
  "/:id/subscribe",
  protect,
  asyncHandler(async (req, res) => {
    const channelId = req.params.id;
    if (String(req.user._id) === channelId)
      return res.status(400).json({ message: "Apne hi channel ko subscribe nahi kar sakte." });
    if (!(await User.exists({ _id: channelId })))
      return res.status(404).json({ message: "Channel nahi mila." });

    const already = req.user.subscriptions.some((s) => String(s) === channelId);
    await User.updateOne(
      { _id: req.user._id },
      already ? { $pull: { subscriptions: channelId } } : { $addToSet: { subscriptions: channelId } }
    );
    const subscribers = await User.countDocuments({ subscriptions: channelId });
    res.json({ subscribed: !already, subscribers });
  })
);

export default router;
