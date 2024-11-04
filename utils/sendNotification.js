import { Notification } from "../models/notification.modal.js";
import { getReciverSocket, io } from "../socket.js";

export const sendNotification = async (userId, fromUserId, type, message) => {
  try {
    // Create a new notification document
    const notification = await Notification.create({
      user: userId,
      notificationFromUser: fromUserId,
      type,
      message,
    });

    // Populate the notification details
    const populatedNotification = await Notification.findById(
      notification._id
    ).populate("notificationFromUser", "profile_picture fullname username");

    // Check if user is online and emit the notification
    const isUserOnline = getReciverSocket(userId);
    if (isUserOnline) {
      io.to(isUserOnline).emit("notification", populatedNotification);
    }

    return populatedNotification; // Optional: return the populated notification if needed
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
