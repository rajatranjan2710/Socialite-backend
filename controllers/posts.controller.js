import cloudinary from "../config/cloudinary.js";
import { Post } from "../models/post.modal.js";
import fs from "fs";
import { User } from "../models/user.modal.js";
import { Notification } from "../models/notification.modal.js";
import { getReciverSocket, io } from "../socket.js";
import { sendNotification } from "../utils/sendNotification.js";

export const createPost = async (req, res) => {
  console.log("hitting");
  const { caption } = req.body;
  const { _id } = req.user;
  const imageFile = req.file; // coming from multer

  // console.warn("Caption is here", caption);
  // console.log("Received file:", imageFile);

  try {
    // Upload the image to Cloudinary if an image is provided
    let media = "";
    if (imageFile) {
      console.warn("Image is here");
      const result = await cloudinary.uploader.upload(imageFile.path);
      media = result.secure_url;

      // Delete the uploaded image file
      fs.unlinkSync(imageFile.path);
    }
    const user = await User.findById(_id);

    const post = new Post({
      user,
      caption,
      media,
    });

    //saving post to users collection
    user.posts.push(post._id);
    await user.save();

    await post.save();
    res
      .status(201)
      .json({ message: "Post created successfully", success: true, post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const deletePost = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== _id.toString()) {
      return res
        .status(401)
        .json({ message: "Unauthorized This isnt your post" });
    }

    await Promise.all([
      Post.findByIdAndDelete(id),
      User.findByIdAndUpdate(
        _id,
        {
          $pull: { posts: id },
        },
        { new: true }
      ),
    ]);
    res
      .status(200)
      .json({ message: "Post deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.user;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      await post.save();
      return res
        .status(200)
        .json({ message: "Post unliked successfully", success: true });
    } else {
      post.likes.push(userId);
      await post.save();

      // Send a like notification to the post owner
      await sendNotification(
        post.user._id,
        userId,
        "like",
        `${req.user.username} liked your post.`
      );

      return res
        .status(200)
        .json({ message: "Post liked successfully", success: true });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const commentOnPost = async (req, res) => {
  const { id } = req.params; // Post ID from request parameters
  const { comment } = req.body; // Comment text from request body
  const { _id: userId } = req.user; // User ID from authenticated user

  if (!comment) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    // Find the post by ID
    const post = await Post.findById(id).populate(
      "comments.user",
      "username profile_picture"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(userId).select(
      "username profile_picture _id"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the comment object
    const newComment = {
      user,
      text: comment,
      timestamp: new Date(),
    };

    // Push the new comment to the post's comments array
    post.comments.push(newComment);
    await post.save();

    // Send a comment notification to the post owner
    await sendNotification(
      post.user._id,
      userId,
      "comment",
      `${req.user.username} commented on your post.`
    );

    return res.status(201).json({
      message: "Comment added successfully",
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error("Error commenting on post:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getUserPosts = async (req, res) => {
  const { id } = req.params; // Get the user ID from the route parameters

  try {
    // Fetch posts of the specific user
    const posts = await Post.find({ user: id }) // Ensure `user` matches the post's user field
      .populate("user", "username profile_picture") // Populate user information, modify fields as needed
      .sort({ createdAt: -1 }); // Sort posts by creation date (newest first)

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  const loggedInUserId = req.user._id; // Get the logged-in user's ID

  try {
    // Find all posts except those created by the logged-in user
    const posts = await Post.find({ user: { $ne: loggedInUserId } })
      .populate("user", "username profile_picture") // Populate user details
      .sort({ createdAt: -1 }); // Optionally sort by created date (most recent first)

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getComments = async (req, res) => {
  const { id } = req.params;
  console.warn("HITTING GET COMMENTS");

  try {
    const post = await Post.findById(id).populate(
      "comments.user",
      "username profile_picture"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ success: true, comments: post.comments });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
