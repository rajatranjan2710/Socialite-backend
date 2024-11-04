import express from "express";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getComments,
  getUserPosts,
  likePost,
} from "../controllers/posts.controller.js";
import { upload } from "../config/multer.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const Router = express.Router();

Router.post("/create", isAuthenticated, upload.single("media"), createPost);
Router.delete("/delete/:id", isAuthenticated, deletePost);
Router.post("/like/:id", isAuthenticated, likePost);
Router.post("/comment/:id", isAuthenticated, commentOnPost);
Router.get("/comment/:id", isAuthenticated, getComments);
Router.get("/:id", isAuthenticated, getUserPosts);
Router.get("/", isAuthenticated, getAllPosts);

export default Router;
