import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  messages: { type: Array, required: true, default: [] },

  // long-term memory (IMPORTANT)
  systemMemory: {
    type: String,
    default: "",
  },
});

const chatModel =
  mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;