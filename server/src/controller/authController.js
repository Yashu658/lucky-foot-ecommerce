import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import generateToken from "../config/jwtToken.js";
import cloudinary from "../config/cloudinary.js";

export const userRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password, gender, dob } = req.body;

    if (!name || !email || !phone || !password || !gender || !dob) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      return next(error);
    }

    const profilePic = `https://placehold.co/400X400?text=${name.charAt(0)}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      gender,
      dob,
      status: "Active",
      role: "User",
      profilePic,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      return next(error);
    }

    // Generate a token for the user
    generateToken(user._id, res);

    // Send the user data along with the token in the response
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user:{
        _id: user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        gender:user.gender,
        dob:user.dob,
        status:user.status,
        role:user.role,
        profilePic:user.profilePic,
      }
     
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const userLogout = async (req, res, next) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const userUpdate= async (req,res,next)=>{
  try{
    const { name, phone, gender, dob } = req.body;
    const userId = req.user._id;
    
    if (!name || !phone || !gender || !dob) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }


    let updateData = { name, phone, gender, dob };

      // console.log(req.file)  .mimetype=file extantion

        // Check if file exists and has the correct properties
        if (req.file && req.file.buffer) {
          try {
            // Convert buffer to base64
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
            const result = await cloudinary.uploader.upload(dataURI, {
              folder: "LuckyFootwear/profilePic",
              width: 250,
              height: 250,
              crop: "fill",
            });
            updateData.profilePic = result.secure_url;
          } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            // If upload fails, use default profile pic
            updateData.profilePic = `https://placehold.co/400X400?text=${name.charAt(
              0
            )}`;
          }
        }

    const updatedUser= await User.findByIdAndUpdate(
      userId ,
      updateData,
      { new: true }
    ).select("-password");

    console.log("req.user:", req.user);

    res.status(200).json({  success: true,
      message: "User updated successfully",
      user: {
            _id: updatedUser._id, 
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        status: updatedUser.status,
        role: updatedUser.role,
        profilePic: updatedUser.profilePic,
      }, });
   
  }catch (error) {
    console.error("Update error:", error);
    next(error);
  }
};

export const userDelete = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    await User.findByIdAndUpdate(
      userId,
      { status: "Inactive" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully", 
    })
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const userAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
      if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
     res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

export const getUser =(req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Send back user info excluding sensitive data
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      gender: req.user.gender,
      dob: req.user.dob,
      status: req.user.status,
      role: req.user.role,
      profilePic: req.user.profilePic,
    },
  });
};