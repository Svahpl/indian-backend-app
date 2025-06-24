

import { User } from "../models/user.models.js";
import { Product } from "../models/product.models.js";
import mongoose from "mongoose";

export const addItemToWishList = async (req, res) => {
    const { userId, productId } = req.params;
    console.log(userId);
    console.log(productId);
    try {
        // 1. Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // 3. Check if product is already in wishlist
        const alreadyInWishlist = user.wishlist?.some(
            (item) => item.productId.toString() === productId
        );

        if (alreadyInWishlist) {
            return res.status(400).json({ success: false, message: "Product already in wishlist" });
        }

        // 4. Add product to wishlist
        user.wishlist = user.wishlist || [];
        user.wishlist.push({productId});

        // 5. Save user
        await user.save();

        res.status(200).json({ success: true, message: "Product added to wishlist" });

    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deletWishListitem = async (req, res) => {
    const { userId, productId } = req.params;

    try {
        // 1. Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // 3. Check if product is in wishlist
        const index = user.wishlist.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({ success: false, message: "Product not in wishlist" });
        }

        // 4. Remove the product from wishlist
        user.wishlist.splice(index, 1);

        // 5. Save the updated user document
        await user.save();

        return res.status(200).json({ success: true, message: "Product removed from wishlist" });

    } catch (error) {
        console.error("Error removing wishlist item:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const getWishListItem = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate("wishlist.productId");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.wishlist || user.wishlist.length === 0) {
            return res.status(404).json({ success: false, message: "No items in your wishlist." });
        }

        // Extract populated product details
        const wishlistProducts = user.wishlist.map((item) => item.productId);

        res.status(200).json({
            success: true,
            message: "Your wishlist items",
            wishlist: wishlistProducts, // this will include all product fields
        });

    } catch (error) {
        console.error("Error loading wishlist items:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const moveWishlistToCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Validate required fields
        if (!userId || !productId) {
            return res.status(403).json({ msg: "userId and productId are required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Check if product is in wishlist
        const isInWishlist = user.wishlist.some(
            item => item.productId.toString() === productId
        );

        if (!isInWishlist) {
            return res.status(404).json({ msg: "Product not found in wishlist" });
        }

        // Check if product is already in cart
        const isInCart = user.cart.some(
            item => item.productId.toString() === productId
        );

        if (!isInCart) {
            user.cart.push({
                productId: new mongoose.Types.ObjectId(productId),
                quantity: 1,
            });
        }

        // Remove from wishlist
        user.wishlist = user.wishlist.filter(
            item => item.productId.toString() !== productId
        );

        await user.save();

        return res.status(200).json({
            msg: "Product moved from wishlist to cart",
            cart: user.cart,
            wishlist: user.wishlist,
        });

    } catch (error) {
        console.error("Error moving wishlist item to cart:", error);
        return res.status(500).json({ msg: "Server error", error });
    }
};

