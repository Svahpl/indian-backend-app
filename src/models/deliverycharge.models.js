import mongoose from "mongoose";
import { required } from "zod/v4-mini";

const deliverySchema = new mongoose.Schema({
    aircharge :{
            type : Number,
            required : true,
            default : 0
    },
    shipcharge : {
            type : Number,
            required : true,
            default : 0
    }
},{timestamps : true})


export const charge = mongoose.model("charge",deliverySchema);