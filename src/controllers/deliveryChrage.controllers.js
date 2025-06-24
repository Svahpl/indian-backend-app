import { charge } from "../models/deliverycharge.models.js";

export const updatecharge = async (req, res) => {
    try {
        const { aircharge, shipcharge } = req.body;

        // Build dynamic update object
        const updateFields = {};
        if (aircharge !== undefined) updateFields.aircharge = aircharge;
        if (shipcharge !== undefined) updateFields.shipcharge = shipcharge;

        // If no fields to update, return error
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ msg: "Please provide aircharge or shipcharge to update" });
        }

        // Update or insert the first charge document
        const updatedCharge = await charge.findOneAndUpdate(
            {},                       // match condition — update first (or only) document
            { $set: updateFields },   // update only provided fields
            { new: true, upsert: true } // return updated doc, create if not found
        );

        return res.status(200).json({
            msg: "Charge updated successfully",
            updatedCharge,
        });

    } catch (error) {
        console.error("Error updating charge:", error);
        return res.status(500).json({ msg: "Server error", error });
    }
};

export const getcharge = async (req,res) => {
    try {
        const delcharge = await charge.find();
        if(!delcharge){
            return res.status(403).json({ msg :"no charge is hear"})
        }

        return res.status(200).json({ msg : "delivery charge fetched !!!" , delcharge});
    } catch (error) {
        console.log(error);
    }
}