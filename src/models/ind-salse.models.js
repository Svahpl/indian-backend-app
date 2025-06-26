import mongoose from "mongoose";

const saleMessageSchema = new mongoose.Schema({
    farmerName: { type: String, required: true },
    pattaNumber: { type: String, required: true }, // PPB/ROFR Patta Number

    state: { type: String, required: true },
    mandal: { type: String, required: true },
    revenueVillage: { type: String, required: true },
    pincode: { type: String, required: true },

    mobileNumber: { type: String, required: true },

    cropName: { type: String, required: true },
    farmingMethod: {
        type: String,
        enum: ["Organic", "Natural Farming", "Inorganic"],
        required: true
    },
    harvestingDate: { type: Date, required: true },

    productName: { type: String, required: true },
    productForm: { type: String, required: true },
    productCondition: {
        type: String,
        enum: ["Fresh", "Dried"],
        required: true
    },

    quantity: { type: String, required: true }, // Allow unit: kg or MT
    pricePerKg: { type: Number, required: true },

    message: { type: String, default: "" }
});

export const SaleMessage = mongoose.model("SaleMessage", saleMessageSchema);
