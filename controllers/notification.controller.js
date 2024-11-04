import { Notification } from "../models/notification.modal.js";

export const getAllNotifications = async (req, res) => {
  const { _id } = req.user;
  try {
    const notifications = await Notification.find({ user: _id })
      .sort({ createdAt: -1 })
      .populate("notificationFromUser", "username profile_picture");

    return res
      .status(200)
      .json({ success: true, Notification: notifications || [] });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    if (notification.user.toString() !== _id.toString()) {
      return res
        .status(401)
        .json({ message: "Unauthorized This isnt your notification" });
    }

    await Notification.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const readNotifications = async (req, res) => {
  const { _id } = req.user;
  try {
    console.warn("HITTING READ NOTIFICATION");
    // Mark all notifications as read
    await Notification.updateMany({ user: _id }, { $set: { isRead: true } });

    // Retrieve updated notifications with populated user details
    const updatedNotifications = await Notification.find({ user: _id })
      .populate("notificationFromUser", "profile_picture fullname username")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, Notification: updatedNotifications || [] });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
