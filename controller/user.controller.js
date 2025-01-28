import User from "../model/user.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import sendmail from "../middleware/db.js";
import jwt from "jsonwebtoken";

// Signup Function
export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Check if the user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const createdUser = new User({
      fullname,
      email,
      password: hashPassword,
    });

    await createdUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: createdUser._id,
        fullname: createdUser.fullname,
        email: createdUser.email,
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await User.findOne({ email: email });
      console.log(user.password);
      if (user != null) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (user.email === email && isMatch) {
          // Generate JWT token
          const token = jwt.sign(
            { userID: user._id },
            process.env.JWT_SEC_KEY,
            { expiresIn: "5d" }
          );
          
          res.send({
            status: "success",
            message: "Login successfully...",
            token: token,
          });
        } else {
          res.send({
            status: "failed",
            message: "Email or Password is not valid",
          });
        }
      } else {
        res.send({ status: "failed", message: "Not Registered ..." });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: "failed", message: "Unable To Login" });
  }
};

// Logout Function
export const logout = async (req, res) => {
  try {
    // Clear the JWT token or session
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// change Password Function
export const changepassword = async (req, res) => {
    try {
      
      const authHeader = req.headers.token;
  
      if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      
      const tokenval = authHeader.split(" ")[1];
  
      console.log("Extracted Token:", tokenval);
  
      
      const decoded = jwt.verify(tokenval, process.env.JWT_SEC_KEY); // Verify the token
      console.log("Decoded Token:", decoded);
  
      
      const { userId } = decoded;
  
      
      const { newPassword } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
  
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error in changepassword:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

//forget password

export const forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Validate email input
      if (!email) {
        console.error("Email not provided");
        return res.status(400).json({ message: "Email is required." });
      }
  
      console.log("Checking user existence...");
      const user = await User.findOne({ email });
  
      if (!user) {
        console.error("User not found");
        return res
          .status(404)
          .json({ message: "User with this email does not exist." });
      }
  
      console.log("User found, generating OTP...");
      // Generate a 6-digit OTP
      const otp = crypto.randomInt(100000, 999999);
  
      console.log("Creating JWT token...");
      // Create a token with the user's ID and OTP, valid for 5 minutes
      const verifyToken = jwt.sign(
        { userId: user._id, otp },
        process.env.ACTIVATION_SECRET,
        { expiresIn: "5m" }
      );
  
      console.log("Sending OTP email...");
      // Send OTP via email
      const emailSent = await sendmail(
        email,
        "Password Reset OTP",
        `Hello ${user.fullname},\n\nYour OTP is: ${otp}.\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this, please ignore this email.`
      );
  
      if (!emailSent) {
        console.error("Failed to send email");
      }
  
      console.log("OTP sent successfully");
      // Respond with success and the token (if needed for client-side validation)
      res.status(200).json({
        message: "OTP sent successfully. Please check your email.",
        verifyToken,
      });
    } catch (error) {
      console.error("Error in resetPassword:", error.message);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
};