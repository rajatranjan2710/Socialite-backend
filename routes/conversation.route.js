import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  getConversation,
  getUserConversations,
} from "../controllers/conversation.controller.js";

const Router = express.Router();

Router.get("/", isAuthenticated, getUserConversations);
Router.get("/:recipientId", isAuthenticated, getConversation);

export default Router;
