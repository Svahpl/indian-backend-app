import { indcharge } from "../models/ind-delcharge.models.js";

export const updateIndCharge = async(req,res) => {
    try {
        const {charge} = req.body;
        const newcharge = await indcharge.findOneAndUpdate({}, { charge }, { new: true, upsert: true })
        if(!newcharge){
            return res.status(402).json({ msg : "charge not change somthing went wrong!!!"})
        }
        return res.status(200).json({msg : "charge changed !!!" , newcharge})
    } catch (error) {
        console.log(error)
    }
}

export const getIndCharge = async(req,res) =>{
    try {
        const charge = await indcharge.find().select("charge");
        if(!charge){
            return res.status(402).json({ msg : "charge not found !!!"});
        }
        return res.status(200).json( { msg : " charge fetched !!!" , charge});
    } catch (error) {
        console.log(error)
    }
}