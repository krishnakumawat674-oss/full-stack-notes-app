const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    if (typeof data.name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name must be a string",
      });
    }

    if (typeof data.email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email must be a string",
      });
    }

    if (typeof data.password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Password must be a string",
      });
    }

    if (!data.name || !data.name.trim()) {
      return res.status(400).json({
        message: "name is required",
      });
    }

    if (!data.email || !data.email.trim()) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    if (!data.password) {
      return res.status(400).json({
        message: "password is required",
      });
    }

    const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
    if (!nameRegex.test(data.name.trim())) {
      return res.status(400).json({
        message: "Invalid name",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    if (data.password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "password length must be minimum 8 characters",
      });
    }

    if (Buffer.byteLength(data.password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "password length must be in~ 72 characters",
      });
    }

    const existingUser = await User.findOne({
      email: data.email.trim().toLowerCase(),
    });
    if (existingUser) {
      return res.status(409).json({
        message: "email already registered",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: hashPassword,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({
        message: "Invalid request body",
        success: false,
      });
    }

    if (typeof data.email !== "string") {
      return res.status(400).json({
        message: "email must be a string",
      });
    }

    if (typeof data.password !== "string") {
      return res.status(400).json({
        message: "password must be a string",
      });
    }

    if (!data.email.trim()) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    if (!data.password.trim()) {
      return res.status(400).json({
        message: "password is required",
      });
    }

    const user = await User.findOne({
      email: data.email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success : false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success : false,
        message: "Invalid email or password",
      });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Login successfull",
        userId: user._id,
        name: user.name,
        email: user.email,
        success: true,
      });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "Get user successfully",
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(200).json({
    success: true,
    message: "user logout successfully",
  });
};

module.exports = { registerUser, loginUser, getCurrentUser, logoutUser };
