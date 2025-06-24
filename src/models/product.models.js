import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        images: {
            type: [String],
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        isWeight: {
            type: Boolean,
            default: true,
        },
        subcategory: {
            type: String,
            required: true,
        },
        KeyIngredients: {
            type: String,
            required: true,
        },
        ratings: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: false,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
            },
        ],
        rating: {
            type: Number,
            default: 0,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

export const Product = mongoose.model('Product', ProductSchema);
