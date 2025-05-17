import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;