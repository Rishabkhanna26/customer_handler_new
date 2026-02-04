import express from "express";
import dotenv from "dotenv";
import http from "node:http";
import { Server } from "socket.io";
import {
  startWhatsApp,
  stopWhatsApp,
  getWhatsAppState,
  whatsappEvents,
} from "./whatsapp.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3001";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

app.get("/whatsapp/status", (req, res) => {
  res.json(getWhatsAppState());
});

app.post("/whatsapp/start", async (req, res) => {
  try {
    const result = await startWhatsApp();
    res.json(result);
  } catch (err) {
    console.error("❌ Failed to start WhatsApp:", err);
    res.status(500).json({ error: "Failed to start WhatsApp" });
  }
});

app.post("/whatsapp/disconnect", async (req, res) => {
  try {
    const result = await stopWhatsApp();
    res.json(result);
  } catch (err) {
    console.error("❌ Failed to disconnect WhatsApp:", err);
    res.status(500).json({ error: "Failed to disconnect WhatsApp" });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const state = getWhatsAppState();
  socket.emit("whatsapp:status", state);
  if (state.qrImage) {
    socket.emit("whatsapp:qr", state.qrImage);
  }
});

whatsappEvents.on("status", (nextStatus) => {
  io.emit("whatsapp:status", {
    status: nextStatus,
    ready: nextStatus === "connected",
    qrImage: getWhatsAppState().qrImage,
  });
});

whatsappEvents.on("qr", (qrImage) => {
  io.emit("whatsapp:qr", qrImage);
});

server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  startWhatsApp().catch((err) => {
    console.error("❌ WhatsApp auto-start failed:", err);
  });
});
