import express from "express";
import { Server } from "socket.io";
import http from "http";
import { configDotenv } from "dotenv";
import cors from "cors";

const expressApp = express();
const server = http.createServer(expressApp);
const io = new Server(server, {
  cors: {
    origin: "https://socialz-frontend.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
configDotenv();



const userSocketMAP = {};

export const getReciverSocket = (receiverId) => {
  return userSocketMAP[receiverId];
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMAP[userId] = socket.id; // Update existing mapping
    console.log("userSocketMAP", userSocketMAP);
    
    socket.emit("welcome", { message: "Welcome to the chat!" });
  } else {
    console.error("No userId provided during socket connection.");
  }

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    for (const userId in userSocketMAP) {
      if (userSocketMAP[userId] === socket.id) {
        delete userSocketMAP[userId];
        break;
      }
    }
  });
});


export { io, server, expressApp };
