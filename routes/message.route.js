import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const Router = express.Router();
// Create a new message
Router.post("/sendmessage/:receiverId", isAuthenticated, sendMessage);

// Get all messages from a conversation with limit and skip for pagination
Router.get("/:conversationId", isAuthenticated, getMessages);

export default Router;
