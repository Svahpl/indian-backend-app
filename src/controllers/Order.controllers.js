import { User } from '../models/user.models.js';
import { Product } from '../models/product.models.js';
import { Order } from '../models/order.models.js';
import axios from 'axios';
import got from 'got';
import orderConfirmationEmail from '../services/OrderConform.js';

// GET Dollar in Indian Rupees

const getCurrentDollarinInr = async () => {
    try {
        const res = await axios.get(`https://open.er-api.com/v6/latest/USD`);
        const inr = res.data.rates.INR;
        return inr;
    } catch (error) {
        console.log(error);
    }
};

// GET Paypal Access token

const getAccessToken = async (req, res) => {
    try {
        const response = await got.post(`${process.env.PAYPAL_BASEURL}/v1/oauth2/token`, {
            form: {
                grant_type: 'client_credentials',
            },
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET,
        });
        const data = JSON.parse(response.body);
        const newAccessToken = data.access_token;
        return newAccessToken;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

// GET Paypal Payment Status

const getPaymentStatus = async orderId => {
    const accessToken = await getAccessToken();
    try {
        const res = await axios.get(`${process.env.PAYPAL_BASEURL}/v2/checkout/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log('----- PAYMENT STATUS RESPONSE ----', res.data.status);
        return res.data.status;
    } catch (error) {
        console.log(`Error during fetching Payment Status: ${error}`);
    }
};

export const getOrders = async (req, res) => {
    const { userId } = req.params;
    try {
        console.log(userId);
        const OrdersFound = await Order.find({ user: userId });
        return res.status(200).json({ OrdersFound });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
};

// FUNCTION for price validation & comparison

const isPriceValid = (backendTotal, frontendTotal, tolerancePercent = 0.1) => {
    const percentageDifference = (Math.abs(backendTotal - frontendTotal) / backendTotal) * 100;
    return percentageDifference <= tolerancePercent;
};

export const createOrder = async (req, res) => {
    const {
        user,
        phoneNumber,
        shippingAddress,
        totalAmount,
        shipThrough,
        items,
        expectedDelivery,
        paypalOid,
    } = req.body;

    try {
        console.log('---debug price:', totalAmount);
        console.log(items);

        // Validate required fields
        if (
            !user ||
            !phoneNumber ||
            !shippingAddress ||
            !totalAmount ||
            !shipThrough ||
            !items ||
            !expectedDelivery
        ) {
            console.log(
                'Missing fields:' +
                    (!user ? ' user' : '') +
                    (!phoneNumber ? ' phoneNumber' : '') +
                    (!shippingAddress ? ' shippingAddress' : '') +
                    (!totalAmount ? ' totalAmount' : '') +
                    (!shipThrough ? ' shipThrough' : '') +
                    (!items ? ' items' : '') +
                    (!expectedDelivery ? ' expectedDelivery' : ''),
            );
            return res.status(400).json({
                success: false,
                message: 'All fields are required!',
            });
        }

        const userFound = await User.findById(user);
        if (!userFound) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const productFound = await Product.findById(items[0].product);
        if (!productFound) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in DB. Might be deleted',
            });
        }

        const productPrice = productFound.price;
        const frontendQuantity = items[0].quantity;
        const frontendWeightPerUnit = items[0].weight;
        const totalWeight = frontendWeightPerUnit * frontendQuantity;

        console.log('debug product price', productPrice);
        console.log('debug product qty', frontendQuantity);
        console.log('debug frontend weight per unit', frontendWeightPerUnit);
        console.log('debug total weight', totalWeight);
        const adminEmail = 'svahpl1@gmail.com';
        const backendProductTotal = productPrice * totalWeight;
        console.log('debug backend product total', backendProductTotal);

        // Get current USD to INR rate
        let dollar = await getCurrentDollarinInr();
        console.log('debug dollar rate', dollar);

        // Calculate shipping cost based on total weight
        let shippingCost;
        if (shipThrough === 'air') {
            shippingCost = totalWeight * (1000 / dollar);
        } else if (shipThrough === 'ship') {
            shippingCost = totalWeight * (700 / dollar);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid Shipping Method',
            });
        }

        console.log('debug shipping cost', shippingCost);

        const backendTotal = backendProductTotal + shippingCost;
        console.log('debug backend total', backendTotal);
        console.log('debug frontend total', totalAmount);

        // Use percentage-based price validation with 0.1% tolerance
        if (!isPriceValid(backendTotal, totalAmount, 0.1)) {
            const percentageDifference =
                (Math.abs(backendTotal - totalAmount) / backendTotal) * 100;
            console.log('Price mismatch detected');
            console.log('BACKEND CALCULATION:', backendTotal);
            console.log('FRONTEND SUBMITTED:', totalAmount);
            console.log('PERCENTAGE DIFFERENCE:', percentageDifference.toFixed(4) + '%');

            return res.status(400).json({
                success: false,
                message: 'Price verification failed',
                debug: {
                    backendCalculation: backendTotal,
                    frontendSubmitted: totalAmount,
                    difference: Math.abs(backendTotal - totalAmount),
                    percentageDifference: percentageDifference.toFixed(4) + '%',
                },
            });
        }

        // Create order if prices match
        const newOrder = await Order.create({
            user: user,
            userName: userFound.FullName,
            userEmail: userFound.Email,
            items: [
                {
                    product: items[0].product,
                    title: productFound.title,
                    images: productFound.images,
                    quantity: frontendQuantity,
                    price: productPrice,
                    weight: frontendWeightPerUnit,
                    totalWeight: totalWeight,
                },
            ],
            phoneNumber: phoneNumber,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            shippingMethod: shipThrough === 'air' ? 'airline' : 'ship',
            shippingCost: shippingCost,
            productTotal: backendProductTotal,
            paymentStatus: 'Pending',
            expectedDelivery: expectedDelivery,
        });

        // Update payment status if already approved
        if (paypalOid) {
            const paymentStatus = await getPaymentStatus(paypalOid);
            if (paymentStatus === 'APPROVED') {
                newOrder.paymentStatus = 'Success'; // Fixed: was using === instead of =
                await newOrder.save(); // Save the updated payment status
            }
        }

        // Reduce Product Stock Quantity
        let availableQty = productFound.quantity - frontendQuantity;
        productFound.quantity = availableQty;
        await productFound.save();

        // Prepare order confirmation email
        const orderData = {
            orderNumber: `#SVAH${Date.now()}`,
            orderDate: new Date().toLocaleDateString(),
            totalAmount: totalAmount.toLocaleString(),
            paymentStatus: newOrder.paymentStatus === 'Success' ? 'Paid' : 'Pending',
            items: [
                {
                    icon: '🌿',
                    name: productFound.title,
                    description: `${totalWeight}kg • Premium Quality`,
                    price: backendProductTotal.toLocaleString(),
                    quantity: frontendQuantity.toString(),
                },
            ],
            deliveryAddress: shippingAddress.replace(/,/g, '<br/>'),
            expectedDelivery: new Date(expectedDelivery).toLocaleDateString(),
            shippingMethod: shipThrough === 'air' ? 'Air Shipping' : 'Sea Shipping',
        };

        // Send confirmation email
        await orderConfirmationEmail(
            userFound.FullName,
            userFound.Email,
            'Order Confirmation - Shree Venkateswara Agros and Herbs',
            orderData,
        );

        await orderConfirmationEmail(
            userFound.FullName,
            adminEmail,
            'Order Confirmation - Shree Venkateswara Agros and Herbs',
            orderData,
        );

        return res.status(200).json({
            success: true,
            message: 'Order Placed Successfully!',
            orderId: newOrder._id,
        });
    } catch (error) {
        console.error('Order creation error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};

export const getAddress = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                msg: 'Order not found',
            });
        }
        const address = order.shippingAddress;
        res.status(200).json({
            success: true,
            msg: 'Address fetched successfully',
            address,
        });
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({
            success: false,
            msg: 'Something went wrong while fetching address',
            error: error.message,
        });
    }
};

export const generateFeatureProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const getRandomProducts = arr => arr.sort(() => 0.5 - Math.random()).slice(0, 4);
        const featuredProducts = getRandomProducts(products);
        return res.status(200).json({ success: true, featuredProducts });
    } catch (error) {
        console.error(`Error generating featured products: ${error}`);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ msg: 'all order fetched', orders });
    } catch (error) {
        console.log(error);
        res.status(402).json({ msg: 'error in fetching product', error });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status value provided.',
        });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.orderStatus = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order,
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while updating status',
            error: error.message,
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId, userId, reason } = req.body;

        if (!orderId || !userId)
            return res.status(400).json({ message: 'orderId and userId are required' });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.user.toString() !== userId)
            return res.status(403).json({ message: 'Unauthorized access to cancel this order' });

        const now = new Date();
        const placedTime = new Date(order.placedAt);
        const diffInMs = now - placedTime;
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours > 24)
            return res
                .status(400)
                .json({ message: 'Cannot cancel order after 24 hours of placement' });

        if (order.cancelled) return res.status(400).json({ message: 'Order already cancelled' });

        order.cancelled = true;
        order.cancelledAt = now;
        order.orderStatus = 'Cancelled';
        order.cancelReason = reason || 'User requested cancellation';
        await order.save();

        return res
            .status(200)
            .json({ success: true, message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while cancelling the order',
            error: error.message,
        });
    }
};
export const indOrder = async (req, res) => {
    try {
        let {
            user,
            phoneNumber,
            shippingAddress,
            items,
            expectedDelivery,
            razorpayOrderId,
        } = req.body;

        // 🔄 Normalize items
        if (!Array.isArray(items)) {
            if (typeof items === 'object' && items !== null) {
                items = [items];
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Items should be an array or a valid object.",
                });
            }
        }

        // ✅ Validate required fields
        if (!user || !phoneNumber || !shippingAddress || !expectedDelivery || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }

        // 🔍 Fetch user
        const userFound = await User.findById(user);
        if (!userFound) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // 🔍 Fetch product
        const productFound = await Product.findById(items[0].product);
        if (!productFound) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in DB. Might be deleted',
            });
        }

        // 🧮 Backend calculation (no shipping cost)
        const quantity = items[0].quantity || 1;
        const weightPerUnit = items[0].weight || 1;
        const totalWeight = quantity * weightPerUnit;
        const productPrice = productFound.price;
        const productTotal = productPrice * totalWeight;
        const totalAmount = productTotal; 

        console.log("💡 Debug: qty =", quantity);
        console.log("💡 Debug: weight per unit =", weightPerUnit);
        console.log("💡 Debug: product price (from DB) =", productPrice);
        console.log("💡 Debug: total weight =", totalWeight);
        console.log("💡 Debug: productTotal =", productTotal);


        // ✅ Set payment status
        let paymentStatus = 'Pending';
        if (razorpayOrderId) {
                paymentStatus = 'Success';
        }

        // ✅ Create order
        const order = await Order.create({
            user,
            userName: userFound.FullName,
            userEmail: userFound.Email,
            items: [
                {
                    product: items[0].product,
                    title: productFound.title,
                    images: productFound.images,
                    quantity,
                    price: productPrice,
                    weight: weightPerUnit,
                    totalWeight,
                },
            ],
            phoneNumber,
            shippingAddress,
            productTotal,
            totalAmount,
            paymentStatus,
            expectedDelivery,
            rzpId: razorpayOrderId,
        });

        // 🧾 Reduce stock
        productFound.quantity -= quantity;
        await productFound.save();

        // 📧 Email confirmation
        const orderData = {
            orderNumber: `#SVAH${Date.now()}`,
            orderDate: new Date().toLocaleDateString(),
            totalAmount: totalAmount.toLocaleString(),
            paymentStatus: paymentStatus === 'Success' ? 'Paid' : 'Pending',
            items: [
                {
                    icon: '🌿',
                    name: productFound.title,
                    description: `${totalWeight}kg • Premium Quality`,
                    price: productTotal.toLocaleString(),
                    quantity: quantity.toString(),
                },
            ],
            deliveryAddress: shippingAddress.replace(/,/g, '<br/>'),
            expectedDelivery: new Date(expectedDelivery).toLocaleDateString(),
            shippingMethod: 'Domestic Shipping',
        };

        await orderConfirmationEmail(
            userFound.FullName,
            userFound.Email,
            'Order Confirmation - Shree Venkateswara Agros and Herbs',
            orderData
        );

        await orderConfirmationEmail(
            userFound.FullName,
            'svahpl1@gmail.com',
            'Order Confirmation - Shree Venkateswara Agros and Herbs',
            orderData
        );

        return res.status(200).json({
            success: true,
            message: "Order Placed Successfully!",
            orderId: order._id,
        });

    } catch (error) {
        console.error("🔥 INR Order Creation Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
