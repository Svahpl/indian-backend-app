import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        //  rzpId: { type: String, required: false },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                title: String,
                images: [String],
                quantity: Number,
                price: Number,
                weight: Number,
            },
        ],

        phoneNumber: {
            type: String,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        shippingAddress: {
            type: String,
            required: true,
        },
        shippingMethod: {
            type: String,
            enum: ['ship', 'airline'],
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Success', 'Failed'],
            default: 'Pending',
        },
        orderStatus: {
            type: String,
            enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        placedAt: {
            type: Date,
            default: Date.now,
        },
        expectedDelivery: {
            type: Date,
            required: false,
        },
        cancelled: {
            type: Boolean,
            default: false,
        },
        cancelledAt: {
            type: Date,
        },
        cancelReason: {
            type: String,
        },
    },
    { timestamps: true },
);

export const Order = mongoose.model('Order', orderSchema);
