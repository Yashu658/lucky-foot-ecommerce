import mongoose from "mongoose";

// Embedded Address Schema
const addressSchema = new mongoose.Schema({
  homeNumber: String,
  street: String,
  landmark: String,
  city: String,
  state: String,
  zip: String,
  phone:String,
}, { _id: true }); // Keep _id if you want to delete/update specific addresses

// Main User Schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    profilePic: {
      type: String,
    },

    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
  
    status: {
      type: String,
      enum: ["Active", "Inactive", "Blocked"],
      default: "Active",
    },
       //Embedded array of addresses
    addresses: [addressSchema],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;