import express from "express";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";

const userRoutes = express.Router();

userRoutes.post('/register',registerUser);
userRoutes.post('/login',loginUser);
userRoutes.get('/logout',logoutUser);
userRoutes.get('/me',userAuth, getMe );

export default userRoutes;