const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!mongoose.isValidObjectId(decoded.userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
