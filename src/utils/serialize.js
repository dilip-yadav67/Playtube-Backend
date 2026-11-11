// RangTube React app jo field names expect karta hai, wahi yahan se bhejte hain:
// id, title, ch, views, age, len, cat, emoji, c1, c2

export function timeAgoHi(date) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} minute`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ghante`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} din`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `${w} ${w === 1 ? "hafta" : "hafte"}`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return `${m} ${m === 1 ? "mahina" : "mahine"}`;
  }
  return `${Math.floor(days / 365)} saal`;
}

export const videoDTO = (v, userId) => ({
  id: v._id,
  title: v.title,
  description: v.description,
  cat: v.category,
  emoji: v.emoji,
  c1: v.c1,
  c2: v.c2,
  len: v.duration,
  views: v.views,
  likes: v.likes.length,
  liked: userId ? v.likes.some((l) => String(l) === String(userId)) : false,
  ch: v.channel?.name ?? null,
  channelId: v.channel?._id ?? v.channel,
  age: timeAgoHi(v.createdAt),
  createdAt: v.createdAt,
});

export const commentDTO = (c, userId) => ({
  id: c._id,
  user: c.user?.name ?? "Unknown",
  text: c.text,
  age: timeAgoHi(c.createdAt),
  mine: userId ? String(c.user?._id ?? c.user) === String(userId) : false,
});

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
