import express from "express";
import {
  commentOnvlog,
  createVlog,
  deleteVlog,
  getAllvlogs,
  getComments,
  getUservlogs,
  likevlog,
} from "../controllers/vlog.controller.js";
import { upload } from "../config/multer.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const Router = express.Router();

Router.post("/create", isAuthenticated, upload.single("media"), createVlog);
Router.delete("/delete/:id", isAuthenticated, deleteVlog);
Router.post("/like/:id", isAuthenticated, likevlog);
Router.post("/comment/:id", isAuthenticated, commentOnvlog);
Router.get("/comment/:id", isAuthenticated, getComments);
Router.get("/:id", isAuthenticated, getUservlogs);
Router.get("/", isAuthenticated, getAllvlogs);

export default Router;
