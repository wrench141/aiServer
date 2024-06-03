import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
  role: { type: String, required: true },
  query: { type: String, required: true },
  response: { type: String, required: true },
  memory_ID: { type: String, required: true },
  created_At: { type: Date, default: Date.now },
});

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;
