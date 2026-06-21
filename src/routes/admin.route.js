import express from "express";
import { adminLogin, adminLogout ,checkAdminAuth  } from "../controllers/adminController.js";
import adminAuth from "../middlewares/adminAuth.js";

const adminRoutes = express.Router();

adminRoutes.post('/login',adminLogin );
adminRoutes.post('/logout',adminLogout );
adminRoutes.get('/check-auth',adminAuth , checkAdminAuth);

export default adminRoutes;