import { User } from "../models/user.modal.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import NodeCache from "node-cache";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { sendNotification } from "../utils/sendNotification.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    //checks
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please enter username and password" });
    }
    //check user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    //generete token and set cookie
    generateToken(user._id, res);

    return res.status(200).json({ message: "Logged in successfully", user });
  } catch (error) {
    console.error("error in login controller :", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const register = async (req, res) => {
  const { username, password, email, fullname } = req.body;
  const profile_picture = req.file;
  try {
    console.log("check in register");
    //checks
    if (!username || !password || !email || !fullname) {
      return res
        .status(400)
        .json({ message: "Please enter username and password" });
    }
    //check user
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    let media = "";
    if (profile_picture) {
      console.warn("Image is here");
      const result = await cloudinary.uploader.upload(profile_picture.path);
      media = result.secure_url;

      // Delete the uploaded image file
      fs.unlinkSync(profile_picture.path);
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      fullname,
      profile_picture:
        media !== ""
          ? media
          : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
    });

    //set cookie
    generateToken(newUser._id, res);

    //saving user to database
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("error in register controller :", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("socialite", "", { maxAge: 0, httpOnly: true, sameSite: "Lax" });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("error in logout controller :", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
};

//get users

// Initialize cache with a time-to-live (TTL) of 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 60 * 5 });

export const getUsers = async (req, res) => {
  try {
    // Get the ID of the logged-in user
    const loggedInUserId = req.user._id;

    // Check if the cached data is already available
    const cachedUsers = cache.get("users");

    if (cachedUsers) {
      // Filter out the logged-in user from the cached data
      const filteredCachedUsers = cachedUsers.filter(
        (user) => user._id.toString() !== loggedInUserId.toString()
      );

      return res.status(200).json({
        message: "Users retrieved from cache (excluding logged-in user)",
        users: filteredCachedUsers,
      });
    }

    console.log("not from cached");

    // Fetch all users except the logged-in user from the database
    const users = await User.find({ _id: { $ne: loggedInUserId } });

    // Store the result in cache for future requests
    cache.set("users", users);

    return res.status(200).json({
      message: "Users retrieved from database (excluding logged-in user)",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

//update user
export const updateUser = async (req, res) => {
  const { _id } = req.user; // Assuming the user is authenticated and `req.user` contains the current user info
  const {
    username,
    fullname,
    email,
    password,
    profile_picture,
    bio,
    location,
    website,
  } = req.body;

  const profilePicture = req.file;

  try {
    // Check if the user exists
    // console.log("user id :", req.user);
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let media = "";
    if (profilePicture) {
      console.warn("Image is here");
      const result = await cloudinary.uploader.upload(profilePicture.path);
      media = result.secure_url;

      // Delete the uploaded image file
      fs.unlinkSync(profilePicture.path);
    }

    // Check for unique fields (username and email)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }
    //TODO:Adding profile picture

    // Update fields if they are present in the request body
    if (username) user.username = username;
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (profile_picture) user.profile_picture = profile_picture;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (website) user.website = website;
    if (media) user.profile_picture = media;

    // If the password is provided, hash it before updating
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    // Save the updated user
    const updatedUser = await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//deleteUser

export const deleteALLUser = async (req, res) => {
  try {
    await User.deleteMany({});
    res
      .status(200)
      .json({ message: "User deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const followUser = async (req, res) => {
  const { id } = req.params; // Extract userId from the request parameters
  const loggedInUserId = req.user._id; // Extract the logged-in user's ID from the request

  try {
    // Check if the user to follow exists
    console.warn("HITTING FOLLOW USER", id);
    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Prevent following oneself
    console.log(loggedInUserId, id);
    if (loggedInUserId.toString() === id) {
      return res
        .status(400)
        .json({ message: "You cannot follow yourself", success: false });
    }

    let message;
    if (userToFollow.followers.includes(loggedInUserId)) {
      // If already following, unfollow
      await Promise.all([
        User.findByIdAndUpdate(loggedInUserId, {
          $pull: { following: id },
        }),
        User.findByIdAndUpdate(id, {
          $pull: { followers: loggedInUserId },
        }),
      ]);
      message = "Unfollowed successfully";
    } else {
      // Follow the user
      await Promise.all([
        User.findByIdAndUpdate(loggedInUserId, {
          $addToSet: { following: id },
        }),
        User.findByIdAndUpdate(id, {
          $addToSet: { followers: loggedInUserId },
        }),
      ]);
      message = "Followed successfully";

      await sendNotification(
        id,
        loggedInUserId,
        "follow",
        `${userToFollow.username} started following you.`
      );
    }

    // Fetch and return the updated user data
    const updatedUser = await User.findById(id);

    return res.status(200).json({
      message,
      success: true,
      updatedUser,
    });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const authCheck = async (req, res) => {
  try {
    console.warn("authenticated in auth check");
    req.ok = true;
    res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Some internal  server error",
    });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id)
      .populate("posts", "caption media createdAt likes comments user")
      .populate("vlogs", "media title description createdAt likes comments");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error in getting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
