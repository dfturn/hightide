"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const socketHandler_1 = require("./socketHandler");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const isProduction = process.env.NODE_ENV === "production";
app.use((0, cors_1.default)({
    origin: isProduction
        ? true
        : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
}));
app.use(express_1.default.json());
// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
// Serve static files in production
if (isProduction) {
    const clientPath = path_1.default.join(__dirname, "../../../client/dist");
    app.use(express_1.default.static(clientPath));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/socket.io")) {
            return next();
        }
        res.sendFile(path_1.default.join(clientPath, "index.html"));
    });
}
// Initialize Socket.io
(0, socketHandler_1.initializeSocketServer)(httpServer);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
