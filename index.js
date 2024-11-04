import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connectDatabase } from "./config/db.js";
import { expressApp, server } from "./socket.js";

// Load environment variables
configDotenv();

// Connect to the database
connectDatabase();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware setup
expressApp.use(
  cors({
    origin: "https://socialz-frontend.vercel.app/",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// Uncomment the following line for logging requests
// expressApp.use(morgan("dev"));
expressApp.use(cookieParser());
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

// Define routes
import AuthRouter from "./routes/user.route.js";
import PostRouter from "./routes/post.route.js";
import MessageRouter from "./routes/message.route.js";
import ConversationRouter from "./routes/conversation.route.js";
import VlogRouter from "./routes/vlog.route.js";
import NotiRouter from "./routes/notification.route.js";

expressApp.use("/api/v1/auth", AuthRouter);
expressApp.use("/api/v1/posts", PostRouter);
expressApp.use("/api/v1/message", MessageRouter);
expressApp.use("/api/v1/conversation", ConversationRouter);
expressApp.use("/api/v1/vlog", VlogRouter);
expressApp.use("/api/v1/notification", NotiRouter);

// API root endpoint
expressApp.get("/", (req, res) => {
  res.json({ hello: "Hello World!" });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//fake data
import { seedUsers } from "./utils/seedUsers.js";
// seedUsers(15);
