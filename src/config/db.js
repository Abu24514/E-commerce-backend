import mongoose, { connect } from "mongoose";

const connectToDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected!");
        
    } catch (error) {
        console.log("Database connection failed" , error);
        
    }
}
export default connectToDb;