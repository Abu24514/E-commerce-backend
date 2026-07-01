import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    count: {
      type: Number,
      default: 0,
    },

    date: {
      type: Number, // Date.now()
      default: Date.now,
    },

    lastRequestAt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const UsageModel = mongoose.model("Usage", usageSchema);

export default UsageModel;