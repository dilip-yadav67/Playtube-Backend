export function notFound(req, res) {
  res.status(404).json({ message: `Route nahi mila: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Yeh email pehle se registered hai." });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON galat hai." });
  }
  console.error(err);
  res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Server mein gadbad hui." : err.message,
  });
}
