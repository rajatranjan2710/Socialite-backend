import { User } from "../models/user.modal.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    // Check if token exists
    const token = req.cookies.socialite;
    if (!token) {
      return res.status(401).json({ message: "Please login to continue" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find user by the decoded user ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    console.log("authenticaed");

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authentication middleware:", error);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired, please login again" });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token, please login again" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
