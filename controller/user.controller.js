import User from "../model/user.model.js";
import crypto from "crypto";
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
        const hashPassword = await bcryptjs.hash(password, 10);

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

        // Find the user in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare the entered password with the hashed password in the database
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Create a JWT token
        const token = jwt.sign({ userId: user._id }, "yourJWTSecretKey", { expiresIn: "1h" });

        res.status(200).json({
            message: "Login successful",
            token, // Include the token in the response
            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal server error" });
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

// Forget Password Function
export const forgetpassword = async (req, res) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            res.status(200).json({ success: true, message: "Email exists" });
        } else {
            res.status(404).json({ success: false, message: "This email does not exist" });
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

//Resend password

export const resendPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            console.log("Email not provided");
            return res.status(400).json({ message: "Email is required." });
        }

        console.log("Checking user existence...");
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User with this email does not exist." });
        }

        console.log("User found, generating OTP...");
        const otp = crypto.randomInt(100000, 999999);

        console.log("Creating JWT token...");
        const verifyToken = jwt.sign(
            { userId: user._id, otp },
            process.env.ACTIVATION_SECRET,
            { expiresIn: "5m" }
        );

        console.log("Sending OTP email...");
        await sendmail(
            email,
            "Password Reset OTP",
            `Hello ${user.fullname},\n\nYour OTP is: ${otp}.\n\nThis OTP is valid for 5 minutes.`
        );

        console.log("OTP sent successfully");
        res.status(200).json({
            message: "OTP sent successfully. Please check your email.",
            verifyToken,
        });
    } catch (error) {
        console.error("Error in resendPassword:", error.message);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
