import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://golfstrimmar18:fqWtWMjFjllm2ZqI@cluster0.hoosr.mongodb.net/start?retryWrites=true&w=majority"
    );
    console.log("MongoDB Cluster0 connected");
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
    process.exit(1);
  }
};
