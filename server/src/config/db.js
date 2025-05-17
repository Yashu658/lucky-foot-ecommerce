import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected", conn.connection.host);
  } catch (e) {
    console.log("Error in MongoDB connection");
    console.log(e.message);
    process.exit(1);
  }
};

export default connectDB;