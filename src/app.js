import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import cors from "cors"
import productRoutes from "./routes/product.route.js";
const app = express();

// use middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin : "http://localhost:5173",
    credential :true
}))

/* Routes */
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);

export default app;