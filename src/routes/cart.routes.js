import express from "express";
import {
  addToCart,
  getUserCart,
  updateCart,
} from "../controllers/cartController.js";
import userAuth from "../middlewares/userAuth.js";
const cartRoutes = express.Router();

cartRoutes.post("/add",userAuth, addToCart);
cartRoutes.get("/get",userAuth, getUserCart);
cartRoutes.patch("/update", userAuth, updateCart);
export default cartRoutes;
