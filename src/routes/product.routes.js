import express from "express";
import {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  updateProduct,
} from "../controllers/productController.js";
import upload from "../middlewares/multer.js";
import adminAuth from "../middlewares/adminAuth.js";
const productRoutes = express.Router();

productRoutes.post(
  "/add",adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct,
);
productRoutes.post("/remove",adminAuth, removeProduct);
productRoutes.patch('/update/:id', adminAuth, updateProduct);
productRoutes.get("/single/:id", singleProduct);
productRoutes.get("/list", listProducts);

export default productRoutes;
