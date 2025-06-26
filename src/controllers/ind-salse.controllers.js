import { SaleMessage } from "../models/ind-salse.models.js";

export const submitSaleMessage = async (req, res) => {
    try {
        const {
            farmerName,
            pattaNumber,
            state,
            mandal,
            revenueVillage,
            pincode,
            mobileNumber,
            cropName,
            farmingMethod,
            harvestingDate,
            productName,
            productForm,
            productCondition,
            quantity,
            pricePerKg,
            message
        } = req.body;

        const newSaleMessage = await SaleMessage.create({
            farmerName,
            pattaNumber,
            state,
            mandal,
            revenueVillage,
            pincode,
            mobileNumber,
            cropName,
            farmingMethod,
            harvestingDate,
            productName,
            productForm,
            productCondition,
            quantity,
            pricePerKg,
            message
        });

        return res.status(201).json({
            msg: "Sale message submitted successfully",
            data: newSaleMessage
        });
    } catch (error) {
        console.error("Error submitting sale message:", error);
        return res.status(500).json({ msg: "Internal server error", error });
    }
};

export const getSale = async (req,res) => {
    try {
        const sale = await SaleMessage.find();
        
        if(!sale){
            return res.status(402).json({msg : "no sale messege found"})
        }

        return res.status(200).json({ msg : "your sale fetched !!!" , sale})
    } catch (error) {
        console.log(error);
    }
}