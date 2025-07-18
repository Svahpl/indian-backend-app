import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { connectToDatabase } from './config/db.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { userRouter } from './src/router/user.router.js';
import { productRouter } from './src/router/product.router.js';
import { webhookRouter } from './src/router/webhook.router.js';
import paypalRouter from './src/router/paypal.router.js';
import { User } from './src/models/user.models.js';
import { OrderRouter } from './src/router/order.router.js';
import { CartRouter } from './src/router/cart.router.js';
import { WishlistRouter } from './src/router/whishlist.router.js';
import { formRouter } from './src/router/form.router.js';
import { deliveryRouter } from './src/router/delevery.router.js';
import { commentRouter } from './src/router/comment.router.js';
import Razorpay from 'razorpay';
import { razorPayRouter } from './src/router/razorpay.router.js';
import { inddelRouter } from './src/router/Ind-del.router.js';
import { saleRouter } from './src/router/ind-sale.router.js';
import { createClerkClient } from '@clerk/backend';
dotenv.config();
const app = express();
const port = process.env.PORT;

// ========================== CORS Setup =========================== //

const corsOptions = {
    origin: [
        'https://www.svahpl.com',
        'https://admin-svah.vercel.app',
        'https://www.svahpl.in',
        'https://admin-indian-panel.vercel.app',
    ],
    credentials: true,
    methods: 'GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS',
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Credentials',
        'cache-control',
        'svix-id',
        'svix-timestamp',
        'svix-signature',
    ],
    exposedHeaders: ['Authorization'],
};

// ====== Development CORS Options ======= //

const devCorsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: 'GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS',
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Credentials',
        'cache-control',
        'svix-id',
        'svix-timestamp',
        'svix-signature',
    ],
    exposedHeaders: ['Authorization'],
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

app.use(cors(corsOptions));
//

// ========================== IMPORTANT: Webhook Route =========================== //

app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);

// ========================== Other Middlewares =========================== //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('/tmp', { index: false }));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get('/', (req, res) => {
    return res.send(`SVAH Indian Server is ready!`);
});

app.use('/api/auth', userRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/paypal', paypalRouter);
app.use('/api/order', OrderRouter);
app.use('/api/cart', CartRouter);
app.use('/api/wishlist', WishlistRouter);
app.use('/api/form', formRouter);
app.use('/api/charge', deliveryRouter);
app.use('/api/indcharge', inddelRouter);
app.use('/api/comment', commentRouter);
app.use('/api/razorpay', razorPayRouter);
app.use('/api/sale', saleRouter);

app.get('/api/protected', ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req.auth.userId;

    // Get the raw JWT token from the Authorization header
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    console.log('User ID:', userId);
    console.log('JWT Token:', token);

    const user = await User.findOne({ clerkUserId: userId });

    if (user && user.isAdmin) {
        return res.status(200).json({ msg: 'User Is Admin' });
    } else {
        return res.status(403).json({ msg: 'Access denied. Not an admin.' });
    }

    res.json({ message: `Hello user ${userId}` });
});

// ========================== DB and Server Start =========================== //

connectToDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

export default app;
