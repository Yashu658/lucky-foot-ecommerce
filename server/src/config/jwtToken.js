import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  try {
    const token = jwt.sign({ key: userId }, process.env.JWT_SECRET, {expiresIn: "1d"});

    res.cookie("jwt", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.log(error);
  }
};

export default generateToken;