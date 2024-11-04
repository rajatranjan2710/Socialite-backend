import express from "express";
import {
  authCheck,
  deleteALLUser,
  followUser,
  getUser,
  getUsers,
  login,
  logout,
  register,
  updateUser,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { upload } from "../config/multer.js";

const Router = express.Router();

Router.get("/test", isAuthenticated, (req, res) => {
  res.send("hello from user route");
});
Router.post("/register", upload.single("profile_picture"), register);
Router.post("/login", login);
Router.get("/logout", logout);
Router.put(
  "/user",
  isAuthenticated,
  upload.single("profilePicture"),
  updateUser
).get("/users", isAuthenticated, getUsers);
Router.post("/follow/:id", isAuthenticated, followUser);
Router.delete("/delete", deleteALLUser); // must not use

//authcheck route
Router.get("/authcheck", isAuthenticated, authCheck);

//get single user
Router.get("/:id", isAuthenticated, getUser);

export default Router;
