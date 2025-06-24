import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName : {type : String , required : true},
    email : { type : String , required : true},
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    product : {type : mongoose.Schema.Types.ObjectId , ref : 'Product'},
    text: String,
    createdAt: { type: Date, default: Date.now },
});
  
export const comment =  mongoose.model("comment",commentSchema)