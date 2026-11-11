import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import videoRoutes from "./src/routes/videos.js";
import commentRoutes from "./src/routes/comments.js";
import channelRoutes from "./src/routes/channels.js";
import { notFound, errorHandler } from "./src/middleware/error.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET .env mein set karo.");
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
  })
);
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date() }));

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api", commentRoutes);
app.use("/api/channels", channelRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
await connectDB();
app.listen(PORT, () => console.log(`Server chal raha hai: http://localhost:${PORT}`));
