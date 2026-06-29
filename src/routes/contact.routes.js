import express from "express"
import contactUs from "../controllers/contactController.js";

const contactRoutes = express.Router();

contactRoutes.post("/", contactUs);

export default contactRoutes;