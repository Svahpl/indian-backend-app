
import { verifyToken } from "@clerk/backend";

export const authVerification = async (req, res ,next) => {

    const token = await req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const {payload }= await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })

        req.user = payload;
        next();


    } catch (error) {
        console.log(error);
        return res.status(400).json({ msg: "somthing went wrong at authverification", error })
    }


}