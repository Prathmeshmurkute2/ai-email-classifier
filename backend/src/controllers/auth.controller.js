import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import User from "../models/user.model.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key", {
    expiresIn: "30d",
  });
};

const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID",
    process.env.GOOGLE_CLIENT_SECRET || "MOCK_CLIENT_SECRET",
    process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback"
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Verify password if user has one (they might have registered with Google only)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was registered using Google. Please log in using Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasGoogleConnected: !!user.googleTokens?.refresh_token,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasGoogleConnected: !!user.googleTokens?.refresh_token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Google Consent screen URL
// @route   GET /api/auth/google/url
// @access  Public (can pass state parameter to link accounts)
export const getGoogleAuthUrl = (req, res) => {
  try {
    const { userId } = req.query; // If client passes userId, we can link Google to existing user
    const state = userId || "auth";

    const oauth2Client = getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Force Google to give refresh token every time
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
      state,
    });

    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
  const { code, state } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!code) {
    return res.redirect(`${frontendUrl}/oauth-callback?error=no_code_provided`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const profile = await oauth2.userinfo.get();
    
    const googleId = profile.data.id;
    const email = profile.data.email;
    const name = profile.data.name;

    let user;

    // Case 1: Linking Google to an existing logged-in user
    if (state && state !== "auth" && state !== "undefined") {
      user = await User.findById(state);
      if (user) {
        user.googleId = googleId;
        user.googleTokens = tokens;
        await user.save();
      }
    }

    // Case 2: Standard Google Login/Signup
    if (!user) {
      // Find by googleId
      user = await User.findOne({ googleId });

      if (!user) {
        // Find by email (maybe registered via password first)
        user = await User.findOne({ email });

        if (user) {
          user.googleId = googleId;
          user.googleTokens = tokens;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            name,
            email,
            googleId,
            googleTokens: tokens,
          });
        }
      } else {
        // Update tokens for existing Google user
        user.googleTokens = {
          ...user.googleTokens,
          ...tokens,
        };
        await user.save();
      }
    }

    const token = generateToken(user._id);

    // Redirect user to the React frontend callback page
    res.redirect(
      `${frontendUrl}/oauth-callback?token=${token}&name=${encodeURIComponent(
        user.name
      )}&email=${encodeURIComponent(user.email)}&connected=true`
    );
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.redirect(`${frontendUrl}/oauth-callback?error=${encodeURIComponent(error.message)}`);
  }
};
