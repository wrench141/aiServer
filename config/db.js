import mongoose from "mongoose";

const DB =
  "mongodb+srv://sidhardhchandra141:L3vrLIUZe1gjd9BJ@cluster0.8u1lg3d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log("Database connected");
    return true;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    return false
  }
};

export default connectDB;
