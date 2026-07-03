import mongoose from "mongoose";

const useSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    cartData: {
      type: Object,
      default: {},
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, minimize: false },
);

const userModel = mongoose.model("user", useSchema);

export default userModel;
