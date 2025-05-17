import connectDB from "../config/db.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const adminData = {
  name: "Admin",
  email: "admin@luckyfoot.com",
  password: "admin123",
  phone: "1234567890",
  gender: "Male",
  dob: "2000-01-01",
  role: "Admin",
  status: "Active",
  profilePic: "https://placehold.co/400X400?text=A",
};

const seedAdmin = async () => {
  console.log("Seeding admin...");
    // Connect to MongoDB
  await connectDB();

  try {
    // Check if admin exists and delete if found
    const adminExists = await User.findOne({ role: "Admin" });
    if (adminExists) {
      await User.deleteOne({ role: "Admin" });
      console.log("Existing admin deleted");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create new admin user
    const admin = await User.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log("Admin created successfully:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};


seedAdmin();