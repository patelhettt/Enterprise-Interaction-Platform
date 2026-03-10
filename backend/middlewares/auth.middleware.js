import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

// Verify JWT Token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password_hash");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.status !== "active" && user.status !== "pending") {
      return res.status(403).json({ error: "Account is not active" });
    }

    req.user = user;
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Token is not valid" });
  }
};

// Check if user is Admin
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.user_type === "admin") {
      return next();
    }

    return res.status(403).json({
      error: "Access denied. Admin privileges required.",
    });
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper to check if user has a specific user type
export const isUserType = (type) => (req, res, next) => {
  if (req.user && req.user.user_type === type) {
    return next();
  }
  return res.status(403).json({
    error: `Access denied. ${type} privileges required.`,
  });
};

