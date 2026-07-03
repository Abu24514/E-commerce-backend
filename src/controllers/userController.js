import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/token.js";
import jwt from "jsonwebtoken";
import transporter from "../config/mailer.js";
/** 
 controller for user registration
 @POST : /api/user/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "please enter a valid email!",
      });
    }

    // validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // check if user already exists
    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create newUser
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // generate jwt token
    const token = generateToken(newUser._id);

    // store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // send safe user data (without password)
    const safeUser = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };

    return res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: `registerUser error : ${error.message}`,
    });
  }
};

/** 
 controller for user login
 @POST : /api/user/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user and include password manually
    const user = await userModel.findOne({ email }).select("+password");

    // check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    // invalid password
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials!",
      });
    }

    // generate jwt token
    const token = generateToken(user._id);

    // store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // send safe user data
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    return res.status(200).json({
      message: "User login successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/** 
 controller for user logout
 @POST : /api/user/logout
 */

export const logoutUser = async (req, res) => {
  try {
    // clear token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
    });

    return res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/** 
 controller for get current user
 @GET : /api/user/me
 */
export const getMe = async (req, res) => {
  try {
    // cookie se userId aaya hai userAuth middleware se
    const user = await userModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // send safe user data
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    return res.status(200).json({
      message: "User fetched successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * controller for edit user profile (name/email only)
 * @PATCH : /api/user/edit-profile
 */
export const editUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // validate email
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    // check if email already exists
    if (email && email !== user.email) {
      const existUser = await userModel.findOne({ email });

      if (existUser) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    return res.status(200).json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: `editUser error: ${error.message}`,
    });
  }
};

/**
 * controller for changing password
 * @PATCH : /api/user/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    // password field select:false hai, isliye +password
    const user = await userModel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: `changePassword error: ${error.message}`,
    });
  }
};

/**
 * controller for forgot-password
 * @POST : /api/user/forgot-password
 */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    const user = await userModel.findOne({
      email: email.trim().toLowerCase(),
    });

    // Security reason
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Your Wearly Password",
      html: `
        <h2>Password Reset</h2>

        <p>You requested a password reset.</p>

        <a href="${resetLink}">
          Reset Password
        </a>

        <p>This link will expire in 15 minutes.</p>

        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * controller for resetPassword
 * @POST : /api/user/reset-password/:token
 */

export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!newPassword?.trim()) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }
    
    if (validator.isEmpty(newPassword.trim())) {
      return res.status(400).json({
        success: false,
        message: "Password cannot be empty",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel
      .findOne({
        _id: decoded.id,
        resetPasswordToken: token,
      })
      .select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset link",
      });
    }

    if (!user.resetPasswordExpire || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Reset link has expired",
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the old password",
      });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset token
    user.resetPasswordToken = "";
    user.resetPasswordExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. Please login.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset link",
    });
  }
};
