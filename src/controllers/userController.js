import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/token.js";
import jwt from "jsonwebtoken";
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
 @GET : /api/user/logout
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
    const user = await userModel.findById(req.userId).select('-password');

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


