import cloudinary from "../config/cloudinary.js";
import { User } from "../models/user.modal.js";
import { Vlog } from "../models/vlog.modal.js";
import fs from "fs";
import { sendNotification } from "../utils/sendNotification.js";

export const createVlog = async (req, res) => {
  console.log("hitting");
  const { title, description } = req.body;
  const { _id } = req.user;
  const imageFile = req.file; // coming from multer

  try {
    // Upload the image to Cloudinary if an image is provided
    let media = "";
    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path);
      media = result.secure_url;

      // Delete the uploaded image file
      fs.unlinkSync(imageFile.path);
    }

    //finding user
    const user = await User.findById(_id);

    const vlog = new Vlog({
      user,
      title,
      description,
      media,
    });

    //saving vlog to users collection
    user.vlogs.push(vlog._id);
    await user.save();

    await vlog.save();
    res
      .status(201)
      .json({ message: "vlog created successfully", success: true, vlog });
  } catch (error) {
    console.error("Error creating vlog:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const deleteVlog = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  try {
    const vlog = await Vlog.findById(id);

    if (!vlog) {
      return res.status(404).json({ message: "vlog not found" });
    }

    if (vlog.user.toString() !== _id.toString()) {
      return res
        .status(401)
        .json({ message: "Unauthorized This isnt your vlog" });
    }

    await Promise.all([
      Vlog.findByIdAndDelete(id),
      User.findByIdAndUpdate(
        _id,
        {
          $pull: { vlogs: id },
        },
        { new: true }
      ),
    ]);
    res
      .status(200)
      .json({ message: "Vlog deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting vlog:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const likevlog = async (req, res) => {
  const { id } = req.params; // vlog ID from request parameters
  const { _id: userId } = req.user; // User ID from authenticated user

  try {
    // Find the vlog by ID
    const vlog = await Vlog.findById(id);
    if (!vlog) {
      return res.status(404).json({ message: "vlog not found" });
    }

    // Check if the user has already liked the vlog
    const hasLiked = vlog.likes.includes(userId);

    if (hasLiked) {
      // User has already liked the vlog, remove like
      vlog.likes = vlog.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      await vlog.save();
      return res
        .status(200)
        .json({ message: "vlog unliked successfully", success: true });
    } else {
      // User hasn't liked the vlog, add like
      vlog.likes.push(userId);
      await vlog.save();

      // Send a like notification to the vlog owner
      await sendNotification(
        vlog.user._id,
        userId,
        "like",
        `${req.user.username} liked your vlog.`
      );

      return res
        .status(200)
        .json({ message: "vlog liked successfully", success: true });
    }
  } catch (error) {
    console.error("Error liking vlog:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const commentOnvlog = async (req, res) => {
  const { id } = req.params; // vlog ID from request parameters
  const { comment } = req.body; // Comment text from request body
  const { _id: userId } = req.user; // User ID from authenticated user

  if (!comment) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    // Find the vlog by ID
    const vlog = await Vlog.findById(id).populate(
      "comments.user",
      "username profile_picture"
    );
    if (!vlog) {
      return res.status(404).json({ message: "vlog not found" });
    }

    const user = await User.findById(userId).select(
      "username profile_picture _id"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the comment object
    const newComment = {
      user: user,
      text: comment,
      timestamp: new Date(),
    };

    // Push the new comment to the vlog's comments array
    vlog.comments.push(newComment);
    await vlog.save();

    // Send a comment notification to the vlog owner
    await sendNotification(
      vlog.user._id,
      userId,
      "comment",
      `${req.user.username} commented on your vlog.`
    );

    return res.status(201).json({
      message: "Comment added successfully",
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error("Error commenting on vlog:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getUservlogs = async (req, res) => {
  const { id } = req.params; //User id from params

  try {
    // Fetch vlogs of the specific user
    const vlogs = await Vlog.find({ user: id })
      .populate("user", "username profile_picture fullname") //
      .sort({ createdAt: -1 });

    if (!vlogs || vlogs.length === 0) {
      return res.status(404).json({ message: "No vlogs found for this user" });
    }

    return res.status(200).json({ vlogs });
  } catch (error) {
    console.error("Error fetching user vlogs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllvlogs = async (req, res) => {
  const loggedInUserId = req.user._id; // Get the logged-in user's ID

  try {
    // Find all vlogs except those created by the logged-in user
    const vlogs = await Vlog.find({ user: { $ne: loggedInUserId } })
      .populate("user", "username profile_picture") // Populate user details
      .sort({ createdAt: -1 }); // Optionally sort by created date (most recent first)

    return res.status(200).json({ success: true, vlogs });
  } catch (error) {
    console.error("Error retrieving vlogs:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getComments = async (req, res) => {
  const { id } = req.params;
  console.warn("HITTING GET COMMENTS IN VLOG CONTROLLER");

  try {
    const vlog = await Vlog.findById(id).populate(
      "comments.user",
      "username profile_picture"
    );

    if (!vlog) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ success: true, comments: vlog.comments });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
