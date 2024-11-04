import { Conversation } from "../models/conversation.modal.js";
import { User } from "../models/user.modal.js";

// Get all conversations for a user
export const getUserConversations = async (req, res) => {
  console.warn("HITTING GET CONVERSATION");

  const { _id: userId } = req.user;

  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "username profile_picture fullname")
      .sort({ updatedAt: -1 });

    if (!conversations) {
      conversations = [];
    }

    return res.status(200).json({
      success: true,
      conversations: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a specific conversation between two users
export const getConversation = async (req, res) => {
  const { _id: userId } = req.user; // Logged-in user
  const { recipientId } = req.params; // Other user in the conversation

  try {
    // Find the conversation between the logged-in user and the recipient
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    }).populate("participants", "username profile_picture");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
