import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.warn("Warning: The server is running, but database operations will fail until MongoDB resolves.");
  }
}

export default connectDB;