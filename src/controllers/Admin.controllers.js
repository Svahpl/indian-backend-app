import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { LoginUser, UserSchema} from "../utils/auth.validation.js";
import { passwordOtpEmail } from "../services/reset-password-otp.js";

export const signup = async (req, res) => {
    try {
        console.log(req.body)
        const { data, error } = UserSchema.safeParse(req.body);
        if (error) {
            return res.json({
                message: error.errors[0].message,
            });
        }
        const {FullName , Email, Password } = data;
        const userExists = await User.findOne({ Email });
        if (userExists)
            return res.status(400).json({
                msg: "Email Already Exists",
            });
        const hashed_password = await bcrypt.hash(Password, 10);
        const newUser = await new User({
            Email,
            Password: hashed_password,
            isAdmin: "false",
            FullName,
        });
        await newUser.save();
        return res.status(200).json({ msg: "Success" });
    } catch (error) {
        console.log(`Error during signup from controller: ${error}`);
    }
};

export const login = async (req, res) => {
    try {
        const { data, error } = LoginUser.safeParse(req.body);
        if (error) {
            return res.json({
                message: error.errors[0].message,
            });
        }

        const { Email, Password } = data;
        console.log(data);
        const userExists = await User.findOne({ Email });
        if (!userExists) {
            // Never let anyone know what is wrong where. eg. hackers
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const user = await userExists.comparePassword(Password);
        const token = await userExists.generateAuthToken();
        console.log(token);
        const option = {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            secure: false, // Set to true if using HTTPS
        };
        if (user) {
            res
                .status(200)
                .cookie("authToken", token, option)
                .json({
                    message: "Login successful",
                    token,
                    userId: await userExists._id.toString(),
                    isAdmin: await userExists.isAdmin,
                });
        } else {
            res.status(401).json({ message: "Invalid Email or password." });
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
        console.log("login controller error", error);
    }
};

export const passwordOtp = async (req, res) => {
    const { Email } = req.body;

    try {
        const user = await User.findOne({ Email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP and expiry
        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP Email
        await passwordOtpEmail(Email, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your Email",
        });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Add this to your auth-controller.js file
export const resetPassword = async (req, res) => {
    const { Email, newPassword } = req.body;

    try {
        // Find the user by Email
        const user = await User.findOne({ Email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account not verified",
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        await User.findOneAndUpdate(
            { Email },
            { Password: hashedPassword }
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error(`Error during password reset: ${error}`);
        return res.status(500).json({
            success: false,
            message: "Password reset failed",
            error: error.message,
        });
    }
};


export const verifyEmail = async (req, res) => {
    const { Email, userOtp } = req.body;

    try {
        // Find user by Email
        const user = await User.findOne({ Email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if OTP has expired
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        // Compare the submitted OTP with stored hashed OTP
        const isOtpValid = await bcrypt.compare(userOtp, user.otp);

        if (isOtpValid) {
            await User.findOneAndUpdate(
                { Email },
                {
                    isVerified: true,
                    otp: null,
                    OtpExpiry: null,
                }
            );

            return res.status(200).json({
                success: true,
                message: "OTP Verified Successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }
    } catch (error) {
        console.error(`Error during OTP verification: ${error}`);
        return res.status(500).json({
            success: false,
            message: "OTP Verification failed",
            error,
        });
    }
  };