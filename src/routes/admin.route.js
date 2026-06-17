import express from "express";
import { adminLogin, adminLogout } from "../controllers/adminController.js";

const adminRoutes = express.Router();

adminRoutes.post('/login',adminLogin );
adminRoutes.post('/logout',adminLogout );

export default adminRoutes;