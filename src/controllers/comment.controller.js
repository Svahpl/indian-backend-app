import { Order } from "../models/order.models.js";
import { comment } from "../models/comment.models.js";
import { Product } from "../models/product.models.js";
import { User } from "../models/user.models.js";

export const addComment = async (req, res) => {
    const { userId, productId, text } = req.body;

    try {

        const user = await User.findById(userId);
        if(!user){
            return res.status(402).json({ msg : "user not found"})
        }


        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Check if user has ordered this product
        const hasOrdered = await Order.findOne({
            user: userId,
            "items.product": productId,  
        });

        if (!hasOrdered) {
            return res.status(403).json({ msg: "You can only comment on products you've purchased." });
        }

        // Save the comment
        const commentMSG = new comment({
            user: userId,
            userName : user.FullName,
            email : user.Email,
            product: productId,
            text,
        });

        await commentMSG.save();

        return res.status(201).json({ msg: 'Comment added successfully', comment: commentMSG });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
};

export const getCommentsByProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const Comments = await comment.find({ product: productId })
            .select("user userName email text product")
            .sort({ createdAt: -1 });

        if (!Comments || Comments.length === 0) {
            return res.status(204).json({ msg: "No comments found for this product." });
        }

        return res.status(200).json({ msg: "Product comments fetched", Comments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
};
