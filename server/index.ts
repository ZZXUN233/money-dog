import express from "express";
import { prisma } from "./prisma.js";

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

app.use(express.json());

// BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

// --- API Routes ---

app.get("/api/ping", (_req, res) => {
  res.json({ pong: true });
});

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Dreams
app.get("/api/dreams", async (_req, res) => {
  const dreams = await prisma.dream.findMany({ orderBy: { createdAt: "desc" } });
  res.json(dreams);
});

app.post("/api/dreams", async (req, res) => {
  const { title, targetAmount, deadline, coverImage } = req.body;
  const now = Date.now();
  const dream = await prisma.dream.create({
    data: {
      title,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || "未定",
      coverImage: coverImage || `https://picsum.photos/400/200?random=${now}`,
      createdAt: now,
      updatedAt: now,
    },
  });
  res.json(dream);
});

app.patch("/api/dreams/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  if (data.currentAmount !== undefined) data.currentAmount = parseFloat(data.currentAmount);
  if (data.targetAmount !== undefined) data.targetAmount = parseFloat(data.targetAmount);
  data.updatedAt = Date.now();
  const dream = await prisma.dream.update({ where: { id }, data });
  res.json(dream);
});

app.delete("/api/dreams/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.dream.delete({ where: { id } });
  res.json({ ok: true });
});

// Diary
app.get("/api/diary", async (_req, res) => {
  const entries = await prisma.diaryEntry.findMany({ orderBy: { createdAt: "desc" } });
  res.json(entries);
});

app.post("/api/diary", async (req, res) => {
  const { date, content, aiComment } = req.body;
  const entry = await prisma.diaryEntry.create({
    data: { date, content, aiComment, createdAt: Date.now() },
  });
  res.json(entry);
});

// Messages
app.get("/api/messages", async (_req, res) => {
  const messages = await prisma.chatMessage.findMany({ orderBy: { timestamp: "asc" } });
  res.json(messages.map(m => ({ ...m, timestamp: Number(m.timestamp) })));
});

app.post("/api/messages", async (req, res) => {
  const { role, text, timestamp, mood } = req.body;
  const message = await prisma.chatMessage.create({
    data: { role, text, timestamp: BigInt(timestamp), mood, createdAt: Date.now() },
  });
  res.json({ ...message, timestamp: Number(message.timestamp) });
});

app.delete("/api/messages", async (_req, res) => {
  await prisma.chatMessage.deleteMany();
  res.json({ ok: true });
});

// --- Frontend Serving ---

if (isProd) {
  // Production: serve built static files
  const { default: path } = await import("path");
  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Development: use Vite dev middleware
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} [${isProd ? "production" : "development"}]`);
});
