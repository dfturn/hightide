import express from "express";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import { initializeSocketServer } from "./socketHandler";

const app = express();
const httpServer = createServer(app);

const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: isProduction
      ? true
      : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Serve static files in production
if (isProduction) {
  // __dirname is /app/server/dist/server/src, so go up 4 levels to /app, then into client/dist
  const clientPath = path.join(__dirname, "../../../../client/dist");
  app.use(express.static(clientPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// Initialize Socket.io
initializeSocketServer(httpServer);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
