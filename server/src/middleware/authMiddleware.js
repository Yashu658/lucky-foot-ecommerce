import jwt from "jsonwebtoken";
import User from "../models/userModel.js";



export const userProtect = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      //console.log("Token received:", token); 
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.key);
      req.user = user;
      next();
    } catch (error) {
      const err = new Error("Not Authorized, Token Failed");
      err.statusCode = 401;
      next(err);
    }
  } else {
    const err = new Error("Not Authorized, No Token");
    err.statusCode = 401;
    next(err);
  }
};


export const adminProtect = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.key);
      if (user.role === "Admin") {
        req.user = user;
        next();
      }
    } catch (error) {
      const err = new Error("Not Authorized, Token Failed");
      err.statusCode = 401;
      next(err);
    }
  } else {
    const err = new Error("Not Authorized, No Token");
    err.statusCode = 401;
    next(err);
  }
};










// export const userProtect = async (req, res, next) => {
//   const token = req.cookies.jwt;

//   if (!token) {
//     console.log("No token in cookies");
//     const err = new Error("Not Authorized, No Token");
//     err.statusCode = 401;
//     return next(err);
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Decoded token:", decoded); 

//     const user = await User.findById(decoded.key);
//     console.log("Token:", token);
//     // if (!user) {
//     //   console.log("User not found in DB for ID:", decoded._id);
//     //   const err = new Error("User not found");
//     //   err.statusCode = 404;
//     //   return next(err);
//     // }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("JWT error:", error);
//     const err = new Error("Not Authorized, Token Failed");
//     err.statusCode = 401;
//     next(err);
//   }
// };
