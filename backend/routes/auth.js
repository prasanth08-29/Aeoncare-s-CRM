import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });

    // Send email to admin
    try {
      await sendEmail({
        to: "prasanthofficial03@gmail.com",
        subject: "New User Registration - Approval Needed",
        text: `
                <h1>New User Registered</h1>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p>Please login to the Admin Dashboard to approve this user.</p>
            `,
      });
    } catch (error) {
      console.error("Email send failed:", error);
      // Do not fail registration if email fails
    }

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      message: "Registration successful. Please wait for admin approval.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isApproved) {
      console.log("Login blocked: Account pending approval", email);
      return res.status(403).json({ message: "Account pending approval" });
    }
    const token = generateToken(user._id);
    console.log("Login successful:", { email, role: user.role });
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role, // Include role in response
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Add new admin (Admin only)
// @route   POST /api/auth/add-admin
// @access  Private/Admin
router.post("/add-admin", protect, admin, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: "admin",
      isApproved: true // Auto-approve admins created by admins
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      message: "New admin added successfully"
    });
  } catch (err) {
    console.error("Add admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Me
router.get("/me", protect, async (req, res) => {
  res.status(200).json(req.user);
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    console.log("Fetching all users for admin:", req.user.email);
    const users = await User.find({}).select("-password");
    console.log("Found users count:", users.length);
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Approve user (Admin only)
// @route   PUT /api/users/:id/approve
// @access  Private/Admin
router.put("/:id/approve", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isApproved = true;
      const updatedUser = await user.save();
      res.json({ message: "User approved", user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default router;
