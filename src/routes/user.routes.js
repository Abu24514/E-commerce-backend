import express from "express";
import {
  changePassword,
  editUser,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";

const userRoutes = express.Router();

userRoutes.post('/register', registerUser);
userRoutes.post('/login', loginUser);
userRoutes.post('/logout', logoutUser);
userRoutes.get('/me', userAuth, getMe);
userRoutes.patch('/edit-profile', userAuth, editUser);
userRoutes.patch('/change-password', userAuth, changePassword);

// forget password 
userRoutes.post("/forgot-password", forgotPassword);

userRoutes.post("/reset-password/:token", resetPassword);

export default userRoutes;