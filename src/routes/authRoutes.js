import express from "express";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters" });
    }

    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    //get random avatar
    const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // Create new user
    const user = new User({
      email,
      password,
      username,
      profileImage,
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token, // Send the token to the client
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error registering user", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    //chech if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      token, // Send the token to the client
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
