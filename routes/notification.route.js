import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  deleteAllNotifications,
  deleteNotification,
  getAllNotifications,
  readNotifications,
} from "../controllers/notification.controller.js";

const Router = express.Router();

Router.get("/", isAuthenticated, getAllNotifications);

Router.delete("/delete/:id", isAuthenticated, deleteNotification);

Router.put("/read", isAuthenticated, readNotifications);

Router.get("/deleteall", deleteAllNotifications);

export default Router;
