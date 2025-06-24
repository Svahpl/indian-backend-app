import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            required: false,
        },
        clerkUserName: {
            type: String,
            required: false,
        },
        FullName: {
            type: String,
            required: false,
        },
        Email: {
            type: String,
            required: true,
        },
        Password: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        ProfileImage: {
            type: String,
            default: false,
        },
        orders: [
            {
                orderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Order',
                    required: false,
                },
            },
        ],
        cart: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
                weight: {
                    type: Number,
                },
            },
        ],
        phoneNumber: {
            type: String,
        },
        address: [
            {
                addressLine1: { type: String },
                addressLine2: String,
                city: { type: String },
                state: { type: String },
                country: { type: String },
                pinCode: { type: String },
                phone: { type: String },
            },
        ],
        isGuest: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        },
        wishlist: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
            },
        ],
    },
    { timestamps: true },
);

UserSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) {
        next();
    }
});

UserSchema.methods.generateAuthToken = async function () {
    try {
        return jwt.sign(
            {
                userId: this._id.toString(),
                email: this.Email,
                isAdmin: this.isAdmin,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: process.env.TOKEN_EXPIRED_TIME,
            },
        );
    } catch (error) {
        console.log(`${error}`);
    }
};

UserSchema.methods.comparePassword = async function (Password) {
    return bcrypt.compare(Password, this.Password);
};

export const User = new mongoose.model('User', UserSchema);
