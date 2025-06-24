
import { Router } from "express";
import { checkout , paymentVerification } from "../controllers/razorpayPayment.controllers.js";

export const razorPayRouter = new Router();

razorPayRouter.route("/checkout").post(checkout);
razorPayRouter.route("/payment-verification").post(paymentVerification);