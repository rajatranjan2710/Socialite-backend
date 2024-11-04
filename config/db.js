import { configDotenv } from "dotenv";
import mongoose from "mongoose";

configDotenv();
export const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {});

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.log(`Error connecting database ${error}`);
  }
};
