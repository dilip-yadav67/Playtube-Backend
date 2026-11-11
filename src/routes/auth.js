import { Router } from "express";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const userJSON = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email aur password dena zaroori hai." });
    if (!emailOk(String(email))) return res.status(400).json({ message: "Email sahi nahi hai." });

    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user: userJSON(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Email aur password dena zaroori hai." });

    const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(String(password))))
      return res.status(401).json({ message: "Email ya password galat hai." });

    res.json({ token: signToken(user._id), user: userJSON(user) });
  })
);

router.get("/me", protect, (req, res) => {
  res.json({ user: userJSON(req.user), subscriptions: req.user.subscriptions });
});

export default router;
