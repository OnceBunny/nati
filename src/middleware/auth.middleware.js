import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

//Just a refrence
//const response = await fetch(`http://localhost:3000/api/books`,{
//method:"POST",
//body:JSON.stringify({
//title,
//caption,}),
//headers:{Authorization:`Bearer ${token}`},
//});

export const protectAuth = async (req, res, next) => {
  try {
    //get token
    const token = req.header("Authorization").replace("Bearer ", ""); //Bearer and empty space gets replaced with empty string and we get token only
    if (!token) {
      res
        .status(401)
        .json({ message: "No authentication token , Access denied" });
    }
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //get user from token
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectAuth middleware", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
