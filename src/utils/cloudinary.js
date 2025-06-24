import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
    path: ".env"
})
cloudinary.config({
    cloud_name: process.env.Cloudinary_name,
    api_key: process.env.Cloudinary_key,
    api_secret: process.env.Cloudinary_api_Secret 
});
const uploadoncloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) {
            return null;
        }
        const result = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto",
        });
        fs.unlinkSync(localfilepath);

        return result;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        fs.unlinkSync(localfilepath);
        return null;
    }
};

const deleteCloudnery = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return result;

    } catch (error) {
        console.log("Cloudinary delete Error:", error);
        return null;
    }
}

export { uploadoncloudinary, deleteCloudnery };