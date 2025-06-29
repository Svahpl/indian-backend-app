// controllers/razorpay.controllers.js
import { instance } from '../../server.js';
import crypto from 'crypto';
import { Payment } from '../models/payment.models.js';
import { Order } from '../models/order.models.js';
// import { sendOrderConfirmationEmail } from "../services/order-confirmation.service.js";
// import { sendNewOrderAdminEmail } from "../services/admin-order.service.js";
import { User } from '../models/user.models.js';

const checkout = async (req, res) => {
    // Expecting req.body.amount in paise (integer)
    if (!req.body || typeof req.body.amount === 'undefined') {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        const amount = Number(req.body.amount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount value' });
        }

        const options = {
            amount: Math.round(amount), // amount already in paise from frontend
            currency: 'INR',
            payment_capture: 1, // auto-capture
        };

        const order = await instance.orders.create(options);
        // console.log('🔹 Order Created:', order);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Razorpay checkout error:', error?.error?.description || error);
        return res.status(500).json({ error: error?.error?.description || 'Checkout failed' });
    }
};

const paymentVerification = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log('🔹 Payment Verification Initiated');

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res
            .status(400)
            .json({ success: false, message: 'Missing payment verification fields' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    try {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
            console.log('❌ Payment Verification Failed: Invalid Signature');
            return res.status(400).json({ success: false, message: 'Invalid Payment Signature' });
        }

        console.log('✅ Payment Verified Successfully');

        // Find and update the order's payment status
        const updatedOrder = await Order.findOneAndUpdate(
            { rzpId: razorpay_order_id },
            { $set: { paymentStatus: 'Success' } },
            { new: true },
        ).populate('user');

        if (!updatedOrder) {
            console.error('❌ Order not found for Razorpay Order ID:', razorpay_order_id);
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Save the payment details, linked to the order
        await Payment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order: updatedOrder._id,
        });

        // Optional: Send confirmation emails (uncomment if implemented)
        if (updatedOrder.user) {
            try {
                const { fullName, email } = updatedOrder.user;
                const orderNumber = razorpay_order_id;
                await sendOrderConfirmationEmail(fullName, orderNumber, email);
                await sendNewOrderAdminEmail(razorpay_order_id, fullName, email);
            } catch (emailError) {
                console.error('❌ Email sending failed:', emailError);
            }
        }

        // Redirect to frontend success page
        return res.redirect(`${process.env.FRONTEND_URL}/complete-payment`);
    } catch (error) {
        console.error('❌ Payment Verification Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

export { checkout, paymentVerification };
