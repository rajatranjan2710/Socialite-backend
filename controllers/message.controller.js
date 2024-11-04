import { Conversation } from "../models/conversation.modal.js";
import { Message } from "../models/message.modal.js";
import { getReciverSocket, io } from "../socket.js";

export const sendMessage = async (req, res) => {
  const { content } = req.body;
  const { receiverId } = req.params;

  const { _id: senderId } = req.user;

  // console.warn({ content, receiverId, senderId });

  try {
    // Ensure both senderId and receiverId are provided
    // console.log({ senderId, receiverId });
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "Sender and receiver are required" });
    }

    // Check if a conversation already exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    // Create a new message
    const newMessage = new Message({
      conversation: conversation._id,
      sender: { _id: senderId, username: "user001" },
      content,
    });

    await newMessage.save();

    // Optionally update the latest message in the conversation
    conversation.last_message = newMessage.content;
    await conversation.save();

    //socket connection
    const reciverSocket = getReciverSocket(receiverId);
    if (reciverSocket) {
      io.to(reciverSocket).emit("newMessage", newMessage);
    }

    res.status(201).json({
      message: "Message sent successfully",
      messageData: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:" + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const limit = parseInt(req.query.limit) || 20; // Default limit is 20 messages
  const page = parseInt(req.query.page) || 0; // Default page is 0
  const skip = page * limit; // Calculate how many messages to skip

  console.log("Fetching messages for conversation:", conversationId);

  try {
    // Find messages and sort by newest first (descending order)
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(limit) // Limit the number of messages
      .skip(skip); // Skip messages for pagination

    if (messages.length === 0) {
      return res.status(200).json({ success: true, messages: [] }); // No more messages
    }

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
