const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * If Authorization: Bearer … is sent, verifies JWT and attaches req.user when valid.
 * Invalid or expired tokens do not fail the request (e.g. guest / stale-token checkout still works).
 */
const optionalUserAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }
  const raw = authHeader.slice(7)?.trim();
  if (!raw) {
    return next();
  }

  try {
    const decoded = jwt.verify(raw, JWT_SECRET);
    const id = decoded.id || decoded._id || decoded.userId;
    if (!id) {
      return next();
    }
    const user = await User.findById(id).select("-password");
    if (user) {
      req.user = user;
    }
  } catch {
    /* ignore: proceed without req.user */
  }
  next();
};

module.exports = optionalUserAuthMiddleware;
