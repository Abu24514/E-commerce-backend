// index.js == server.js 
import app from "./src/app.js";
import dotenv from "dotenv/config";
import connectToDb from "./src/config/db.js";
import connectCloudinary from "./src/config/cloudinary.js";

const PORT =process.env.PORT || 3000;

// Database call
connectToDb();
// Cloudinary
connectCloudinary();

app.get ('/' ,(req , res)=> res.send("Backend is live."))

app.listen(PORT , ()=>{
    console.log(`Server is running on ${PORT}`);
    
})