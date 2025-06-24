import { User } from '../models/user.models.js';
import { Product } from '../models/product.models.js';
import { Order } from '../models/order.models.js';
import mongoose from 'mongoose';
import orderConfirmationEmail from '../services/OrderConform.js';
import axios from 'axios';
import got from 'got';

export const addCart = async (req, res) => {
    const { userId, productId, quantity, weight } = req.body;

    // ✅ Check for required fields
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing userId' });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing productId' });
    }

    try {
        const productToAdd = await Product.findById(productId);
        if (!productToAdd) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const existingCartItemIndex = user.cart.findIndex(
            item => item.productId.toString() === productId && item.weight === weight,
        );

        if (existingCartItemIndex !== -1) {
            user.cart[existingCartItemIndex].quantity += quantity;
        } else {
            user.cart.push({
                productId: productToAdd._id,
                quantity,
                weight,
            });
        }

        await user.save();

        return res.status(200).json({
            message:
                existingCartItemIndex !== -1
                    ? 'Item quantity updated in cart'
                    : 'Item added to cart successfully',
            success: true,
            product: productToAdd,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Some error occurred in addCart',
            error,
        });
    }
};

export const deleteCartItem = async (req, res) => {
    try {
        // get user and product id
        const { userId, productId } = req.query;
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Product ID are required',
            });
        }
        // search product inside cart and delete it
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    cart: { productId: productId },
                },
            },
            { new: true },
        );
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Product removed from cart successfully',
            cart: updatedUser.cart, // Return updated cart
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: 'false',
            message: "Error deleting item from user's cart",
        });
    }
};

export const getUserCart = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID required',
            });
        }

        // Fetch user with cart only
        const user = await User.findById(userId).select('cart');
        if (!user || user.cart.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No items in cart',
                items: [],
            });
        }

        // Create map of productId + weight => cart item details
        const cartItemsMap = {};
        user.cart.forEach(item => {
            const key = `${item.productId.toString()}_${item.weight}`;
            cartItemsMap[key] = {
                quantity: item.quantity,
                cartId: item._id,
                weight: item.weight,
            };
        });

        // Fetch product info
        const uniqueProductIds = [...new Set(user.cart.map(item => item.productId))];
        const products = await Product.find({
            _id: { $in: uniqueProductIds },
        });

        // Map products with their corresponding quantity and weight
        const itemsWithDetails = user.cart
            .map(cartItem => {
                const product = products.find(
                    p => p._id.toString() === cartItem.productId.toString(),
                );
                if (!product) return null;

                return {
                    ...product.toObject(),
                    quantity: cartItem.quantity,
                    weight: cartItem.weight,
                    cartId: cartItem._id,
                };
            })
            .filter(item => item !== null); // Remove any nulls from unfound products

        // Send response
        return res.status(200).json({
            success: true,
            message: 'Cart items fetched successfully',
            items: itemsWithDetails,
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching cart items',
            error: error.message,
        });
    }
};

export const updateCartItemQuantity = async (req, res) => {
    try {
        const { userId, cartItemId } = req.params;
        const { action, newQuantity } = req.body;

        console.log('userId:', userId);
        console.log('cartItemId:', cartItemId);
        console.log('Action:', action);

        // Convert cartItemId to ObjectId
        const objectIdCartItemId = new mongoose.Types.ObjectId(cartItemId);

        // Fetch the user document
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find the cart item by its _id
        const itemFound = user.cart.find(
            item => item._id.toString() === objectIdCartItemId.toString(),
        );

        if (!itemFound) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        // Now fetch the product using itemFound.productId
        const product = await Product.findById(itemFound.productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Handle Increase Action
        if (action === 'increase') {
            if (itemFound.quantity + 1 > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.quantity} items left in stock`,
                });
            }
            itemFound.quantity += 1;
        }

        // Handle Decrease Action
        else if (action === 'decrease') {
            if (itemFound.quantity - 1 < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity cannot be less than 1',
                });
            }
            itemFound.quantity -= 1;
        }

        // Handle Direct Quantity Update
        else if (newQuantity) {
            if (newQuantity > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.quantity} items left in stock`,
                });
            }
            if (newQuantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity cannot be less than 1',
                });
            }
            itemFound.quantity = newQuantity;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action or newQuantity',
            });
        }

        // Mark cart as modified
        user.markModified('cart');

        // Save the updated user document
        await user.save();

        return res.status(200).json({ success: true, itemFound });
    } catch (error) {
        console.log(`Error updating cart item quantity: ${error}`);
        return res.status(500).json({ success: false, error });
    }
};

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

// FUNCTION for price validation & comparison

const isPriceValid = (backendTotal, frontendTotal, tolerancePercent = 0.1) => {
    const percentageDifference = (Math.abs(backendTotal - frontendTotal) / backendTotal) * 100;
    return percentageDifference <= tolerancePercent;
};

export const createCartOrder = async (req, res) => {
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

        const productIds = items.map(item => item._id);
        const productPrices = items.map(item => item.price);
        const productTotalPrice = productPrices.reduce((sum, p) => sum + p, 0);
        const quantityArray = items.map(item => item.quantity);
        const weightArray = items.map(item => item.weight);

        const individualItemTotalWeight = items.map(item => item.weight * item.quantity);
        const totalWeight = individualItemTotalWeight.reduce((sum, weight) => sum + weight, 0);
        console.log('Debug Product Prices', productPrices);
        console.log('Debug Quantities qty', quantityArray);
        console.log('Debug Frontend Weight/unit', weightArray);
        console.log('Debug total weight', individualItemTotalWeight);

        let backendProductTotal = 0;

        for (let i = 0; i < items.length; i++) {
            backendProductTotal += productPrices[i] * individualItemTotalWeight[i];
        }

        console.log('Debug backend product total', backendProductTotal);

        // GET current USD in INR
        let dollar = await getCurrentDollarinInr();
        console.log('Debug Dollar Rate', dollar);

        // CALCULATE shipping code based on total weight
        let shippingCost;
        if (shipThrough === 'air') {
            shippingCost = totalWeight * (1000 / dollar);
        } else if (shipThrough === 'ship') {
            shippingCost = totalWeight * (700 / dollar);
        } else {
            return res.status(400).json({
                success: false,
                message: 'INVALID Shipping Method',
            });
        }

        console.log('Debug Shipping Cost', shippingCost);
        const adminEmail = "svahpl1@gmail.com"
        const backendTotal = backendProductTotal + shippingCost;

        console.log('Debug Backend Total', backendTotal);
        console.log('Debug Frontend Total', totalAmount);

        // USE percentage-based price validation with 0.1% tolerance
        if (!isPriceValid(backendTotal, totalAmount, 0.1)) {
            const percentageDifference =
                (Math.abs(backendTotal - totalAmount) / backendTotal) * 100;

            console.log('PRICE Mismatch Detected');
            console.log('BACKEND Calculation', backendTotal);
            console.log('FRONTEND Submitted', totalAmount);
            console.log('PERCENTAGE Difference', percentageDifference);

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

        // REFACTOR ITEMS ARRAY TO PASS IN ORDER DOCUMENT

        const reformattedItems = items.map(item => {
            const frontendQuantity = item.quantity;
            const productPrice = item.price;
            const frontendWeightPerUnit = item.weight;
            const totalWeight = frontendQuantity * frontendWeightPerUnit;

            return {
                product: item._id,
                title: item.title,
                images: item.images,
                quantity: frontendQuantity,
                price: productPrice,
                weight: frontendWeightPerUnit,
                totalWeight: totalWeight,
            };
        });

        // CREATE Order if price matches

        const newOrder = await Order.create({
            user: user,
            userName: userFound.FullName,
            userEmail: userFound.Email,
            items: reformattedItems,
            phoneNumber: phoneNumber,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            shippingMethod: shipThrough === 'air' ? 'airline' : 'ship',
            shippingCost: shippingCost,
            productTotal: backendProductTotal,
            paymentStatus: 'Pending',
            expectedDelivery: expectedDelivery,
        });

        // UPDATE Payment Status if already Approved
        if (paypalOid) {
            const paymentStatus = await getPaymentStatus(paypalOid);
            if (paymentStatus === 'APPROVED') {
                newOrder.paymentStatus = 'Success';
                await newOrder.save();
            }
        }

        // REDUCE Product Stock Quantity
        for (let item of items) {
            const productFound = await Product.findById(item._id);
            if (productFound) {
                const availableQty = productFound.quantity - item.quantity;

                // Prevent negative stock
                productFound.quantity = availableQty >= 0 ? availableQty : 0;

                await productFound.save();
            } else {
                console.warn(`Product not found for stock update: ${item._id}`);
            }
        }

        // DELETE ITEMS from cart of User.
        userFound.cart = [];
        await userFound.save();

        // REFACTOR ITEMS ARRAY TO PASS IN EMAIL

        const displayItems = items.map(item => {
            const frontendQuantity = item.quantity;
            const productPrice = item.price;
            const frontendWeightPerUnit = item.weight;
            const totalWeight = frontendQuantity * frontendWeightPerUnit;
            const backendProductTotal = productPrice * totalWeight;

            return {
                icon: '🌿',
                name: item.title,
                description: `${totalWeight}kg • Premium Quality`,
                price: backendProductTotal.toLocaleString(), // formatted with commas
                quantity: frontendQuantity.toString(), // ensure it's a string
            };
        });

        // PREPARE Order Confirmation email

        const orderData = {
            orderNumber: `#SVAH${Date.now()}`,
            orderDate: new Date().toLocaleDateString(),
            totalAmount: totalAmount.toLocaleString(),
            paymentStatus: newOrder.paymentStatus === 'Success' ? 'Paid' : 'Pending',
            items: displayItems,
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
        console.log(error);
        return res
            .status(500)
            .json({ error, success: false, message: 'Error from cart order controller' });
    }
};

export const createCartINROrder = async (req, res) => {
    try {
        const {
            user,
            phoneNumber,
            shippingAddress,
            items,
            expectedDelivery,
            razorpayOrderId,
        } = req.body;

        // Validate inputs
        if (!user || !phoneNumber || !shippingAddress || !expectedDelivery || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required!',
            });
        }

        // Fetch user
        const userFound = await User.findById(user);
        if (!userFound) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate backend total
        let productTotal = 0;
        const formattedItems = [];

        for (const item of items) {
            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item._id}` });
            }

            const quantity = item.quantity || 1;
            const weight = item.weight || 1;
            const totalWeight = quantity * weight;
            const price = product.price;

            const itemTotal = price * totalWeight;
            productTotal += itemTotal;

            // Format order item
            formattedItems.push({
                product: product._id,
                title: product.title,
                images: product.images,
                quantity,
                price,
                weight,
                totalWeight,
            });

            // Reduce stock
            product.quantity = Math.max(product.quantity - quantity, 0);
            await product.save();
        }

        const totalAmount = productTotal;
        const paymentStatus = razorpayOrderId ? 'Success' : 'Pending';

        // Create order
        const newOrder = await Order.create({
            user,
            userName: userFound.FullName,
            userEmail: userFound.Email,
            items: formattedItems,
            phoneNumber,
            shippingAddress,
            productTotal,
            totalAmount,
            expectedDelivery,
            paymentStatus,
            rzpId: razorpayOrderId,
        });

        // Clear user's cart
        userFound.cart = [];
        await userFound.save();

        // Prepare items for email
        const emailItems = formattedItems.map(item => ({
            icon: '🌿',
            name: item.title,
            description: `${item.totalWeight}kg • Premium Quality`,
            price: (item.price * item.totalWeight).toLocaleString(),
            quantity: item.quantity.toString(),
        }));

        // Email payload
        const orderData = {
            orderNumber: `#SVAH${Date.now()}`,
            orderDate: new Date().toLocaleDateString(),
            totalAmount: totalAmount.toLocaleString(),
            paymentStatus: paymentStatus === 'Success' ? 'Paid' : 'Pending',
            items: emailItems,
            deliveryAddress: shippingAddress.replace(/,/g, '<br/>'),
            expectedDelivery: new Date(expectedDelivery).toLocaleDateString(),
            shippingMethod: 'Domestic Shipping',
        };

        // Send emails
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
            message: 'Order Placed Successfully!',
            orderId: newOrder._id,
        });

    } catch (error) {
        console.error('🔥 Cart INR Order Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
};

