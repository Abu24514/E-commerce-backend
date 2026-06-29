import express from "express";
import subscribeNewsletter from "../controllers/newsletterController.js";

const newsletterRoutes = express.Router();
newsletterRoutes.post("/subscribe", subscribeNewsletter);

export default newsletterRoutes;