import express from "express";
import { Server } from "socket.io";
import http from "http";
import { configDotenv } from "dotenv";
import cors from "cors";

const expressApp = express();
const server = http.createServer(expressApp);
const io = new Server(server, {
  cors: {
    origin: "https://socialite-be79.onrender.com",
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
  userSocketMAP[userId] = socket.id;
  console.log("userSocketMAP", userSocketMAP);

  //on message

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

export { io, server, expressApp };
