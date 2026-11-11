import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

async function userFromRequest(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(id);
  } catch {
    return null;
  }
}

// Login zaroori
export async function protect(req, res, next) {
  try {
    const user = await userFromRequest(req);
    if (!user) return res.status(401).json({ message: "Pehle login karo." });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Login ho to user attach karo, warna chalne do (liked jaise flags ke liye)
export async function optionalAuth(req, _res, next) {
  try {
    req.user = await userFromRequest(req);
    next();
  } catch (err) {
    next(err);
  }
}
