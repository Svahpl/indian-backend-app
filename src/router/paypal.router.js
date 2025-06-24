import express from 'express';
import { Router } from 'express';
import got from 'got';

const paypalRouter = Router();

const getAccessToken = async (req, res) => {
    try {
        const response = await got.post(`${process.env.PAYPAL_BASEURL}/v1/oauth2/token`, {
            form: {
                grant_type: 'client_credentials',
            },
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET,
        });
        // console.log(response.body);
        // cache and return the access token
        const data = JSON.parse(response.body);
        const newAccessToken = data.access_token;
        return newAccessToken;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

const createOrder = async (req, res) => {
    const price = req.body.price;
    console.log(`---debug price: ${price}`);
    if (!price) {
        return res.status(500).json({ msg: 'Price Not Available' });
    }
    try {
        const accessToken = await getAccessToken();

        const response = await got.post(`${process.env.PAYPAL_BASEURL}/v2/checkout/orders`, {
            headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            json: {
                intent: 'CAPTURE',
                payment_source: {
                    paypal: {
                        experience_context: {
                            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                            payment_method_select: 'PAYPAL',
                            brand_name: 'Weborium - Software Agency',
                            shipping_preference: 'SET_PROVIDED_ADDRESS',
                            locale: 'en-US',
                            user_action: 'PAY_NOW',
                            return_url: `${process.env.PAYPAL_BASEURL}/complete-payment`,
                            cancel_url: `${process.env.PAYPAL_BASEURL}/cancel-payment`,
                        },
                    },
                },
                purchase_units: [
                    {
                        shipping: {
                            name: {
                                full_name: 'John Doe',
                            },
                            address: {
                                address_line_1: '123 Main St',
                                admin_area_2: 'Anytown',
                                admin_area_1: 'CA',
                                postal_code: '12345',
                                country_code: 'US',
                            },
                        },
                        items: [
                            {
                                name: 'iPhone 14 pro max',
                                description: 'Phone of the year award.',
                                quantity: '1',
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: price,
                                },
                            },
                        ],
                        amount: {
                            currency_code: 'USD',
                            value: price,
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: price,
                                },
                            },
                        },
                    },
                ],
            },
        });

        const order = JSON.parse(response.body);
        const orderId = order.id;
        return res.status(200).json({ orderId });
    } catch (error) {
        console.error('Status Code:', error.response?.statusCode);
        console.error('Response Body:', error.response?.body);
        return res.status(500).json({
            success: false,
            message: 'Error from Order Creation Controller',
            error: error,
        });
    }
};

paypalRouter.post('/create-order', createOrder);

export default paypalRouter;
