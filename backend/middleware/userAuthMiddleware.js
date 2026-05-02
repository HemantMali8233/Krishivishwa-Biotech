const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token: User not found" });
    }

    req.user = user; // ✅ THIS is what we need
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = userAuthMiddleware;
