import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js"

export const AdminVerify = async (req, res, next) => {
    try {
        const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;

        const user = await User.findById(decoded.userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        next(); // User is admin, continue
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

