import express from "express";
import {
  placeOrder,
  // placeOrderStrip ,
  // placeOrderRazorpay ,
  allOrders,
  userOrders,
  updateStatus,
} from "../controllers/orderController.js";
import adminAuth from "../middlewares/adminAuth.js";
import userAuth from "../middlewares/userAuth.js";
const orderRoutes = express.Router();

// Admin features
orderRoutes.get("/list", adminAuth, allOrders);
orderRoutes.post("/status", adminAuth, updateStatus);
//Payment features

orderRoutes.post("/place", userAuth, placeOrder);
// orderRoutes.post('/stripe',userAuth ,placeOrderStrip);
// orderRoutes.post('/razorpay',userAuth ,placeOrderRazorpay);
// user features
orderRoutes.post("/userorders", userAuth, userOrders);
export default orderRoutes;
