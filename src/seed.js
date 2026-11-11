// Demo data: npm run seed
// Dhyan do: yeh purana saara data hata kar naya bharta hai.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Video from "./models/Video.js";
import Comment from "./models/Comment.js";

const DAY = 86400000;
// [title, channel, views, daysAgo, seconds, category, emoji, c1, c2]
const DATA = [
  ["Chai se Chatni tak: Kanpur ka street food tour", "Swad Safar", 1200000, 3, 760, "Vlog", "🍢", "#FF9A3D", "#FF3D81"],
  ["React 18 hindi mein: 30 minute mein seekho", "Code Chai", 860000, 7, 1805, "Coding", "⚛️", "#14C9AD", "#1B6EF3"],
  ["Last over thriller: 6 gend, 11 run", "Stump Mic", 3400000, 2, 552, "Cricket", "🏏", "#5CC8FF", "#7B5CFF"],
  ["Lo-fi beats: padhai ke liye 1 ghanta", "Raat ki Dhun", 5100000, 30, 3600, "Music", "🎧", "#FF3D81", "#7B5CFF"],
  ["Perfect dum biryani, bina jhanjhat ke", "Rasoi Rang", 2700000, 5, 1102, "Cooking", "🍛", "#FFC83D", "#FF6B3D"],
  ["Minecraft mein pura shehar bana diya", "Pixel Pandit", 640000, 4, 1491, "Gaming", "⛏️", "#B6E34A", "#14C9AD"],
  ["Javascript ke 10 tricks jo koi nahi batata", "Code Chai", 1900000, 14, 843, "Coding", "🧠", "#7B5CFF", "#FF3D81"],
  ["Manali road trip: sirf ₹5000 mein", "Ghumakkad Gang", 780000, 6, 1269, "Vlog", "🏔️", "#5CC8FF", "#14C9AD"],
  ["Masala maggi ke 5 naye twist", "Rasoi Rang", 410000, 21, 468, "Cooking", "🍜", "#FFC83D", "#FF3D81"],
  ["Boss fight: ek hi try mein jeet gaye?", "Pixel Pandit", 2200000, 1, 990, "Gaming", "👾", "#7B5CFF", "#1B1340"],
  ["Acoustic cover: purane gaano ki yaad", "Raat ki Dhun", 1400000, 60, 336, "Music", "🎸", "#FF9A3D", "#FF3D81"],
  ["IPL ke top 5 yorkers, slow motion mein", "Stump Mic", 990000, 7, 662, "Cricket", "🎯", "#14C9AD", "#5CC8FF"],
];

await connectDB();
await Promise.all([User.deleteMany({}), Video.deleteMany({}), Comment.deleteMany({})]);

// Har channel ek user hai (password: password123)
const channelNames = [...new Set(DATA.map((d) => d[1]))];
const channels = {};
for (const name of channelNames) {
  const slug = name.toLowerCase().replace(/\s+/g, "");
  channels[name] = await User.create({ name, email: `${slug}@rangtube.dev`, password: "password123" });
}
const demo = await User.create({ name: "Demo User", email: "demo@rangtube.dev", password: "password123" });

const videos = [];
for (const [title, ch, views, daysAgo, duration, category, emoji, c1, c2] of DATA) {
  const createdAt = new Date(Date.now() - daysAgo * DAY);
  videos.push(
    await Video.create({
      title, category, emoji, c1, c2, duration, views, createdAt,
      description: `${category} category ka video: ${title}`,
      channel: channels[ch]._id,
    })
  );
}

await Comment.insertMany([
  { video: videos[1]._id, user: demo._id, text: "Ekdum mast video, aise hi banate raho! 🔥" },
  { video: videos[1]._id, user: channels["Stump Mic"]._id, text: "Yeh dekh ke maza aa gaya, share kar diya." },
  { video: videos[2]._id, user: demo._id, text: "Last over mein dil ki dhadkan ruk gayi 😮" },
]);

console.log(`Seed ho gaya: ${channelNames.length + 1} users, ${videos.length} videos.`);
console.log("Login: demo@rangtube.dev / password123");
await mongoose.disconnect();
