import mongoose from "mongoose";

const DelCharge = new mongoose.Schema({

    charge : {
        type : Number,
        required : true
    }

},{timestamps : true})

export const indcharge = mongoose.model("indcharge", DelCharge);