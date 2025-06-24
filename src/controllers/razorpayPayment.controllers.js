import { instance } from "../../server.js";
import crypto from "crypto";
import { Payment } from "../models/payment.models.js";
import { Order } from "../models/order.models.js";
// import { sendOrderConfirmationEmail } from "../services/order-confirmation.service.js";
// import { sendNewOrderAdminEmail } from "../services/admin-order.service.js";
import { User } from "../models/user.models.js";


const checkout = async(req,res)=>{
    const options = {
        amount: Number(req.body.amount * 100),
        currency: "INR",
      };

    const order = await instance.orders.create(options);
    console.log("🔹 Order Created:", order);
    res.status(200).json({ success: true, order });
}

const paymentVerification = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;
    console.log("🔹 Payment Verification Initiated");

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    try {
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;
        if (!isSignatureValid) {
            console.log("❌ Payment Verification Failed: Invalid Signature");
            return res
                .status(400)
                .json({ success: false, message: "Invalid Payment Signature" });
        }

        console.log("✅ Payment Verified Successfully");
        await Payment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        const updatedOrder = await Order.findOneAndUpdate(
            { rzpId: razorpay_order_id },
            { $set: { paymentStatus: "Success" } },
            { new: true }
        ).populate("user");

        if (updatedOrder?.user) {
            try {
                const customerName = updatedOrder.user.fullName;
                const email = updatedOrder.user.email;
                const orderNumber = razorpay_order_id;

                await sendOrderConfirmationEmail(customerName, orderNumber, email);
                await sendNewOrderAdminEmail(razorpay_order_id, customerName, email);
            } catch (emailError) {
                console.error("❌ Email sending failed:", emailError);
            }
        }

        return res.redirect(
            `${process.env.DEV_FRONTEND_URL}/payment-success?reference=${razorpay_payment_id}`
        );
    } catch (error) {
        console.error("❌ Payment Verification Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
  };


export {checkout , paymentVerification}