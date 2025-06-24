import Router from 'express';
import {
    createOrder,
    getAddress,
    getOrders,
    getAllOrder,
    updateOrderStatus,
    cancelOrder,
    indOrder
} from '../controllers/Order.controllers.js';
import { AdminVerify } from '../middlewares/Admin.middlewares.js';
import { createCartOrder, createCartINROrder } from '../controllers/Cart.controllers.js';

export const OrderRouter = new Router();

OrderRouter.route('/create-order').post(createOrder);
OrderRouter.route('/create-cart-order').post(createCartOrder);
OrderRouter.route('/cancel-order').delete(cancelOrder);
OrderRouter.route('/get-order/:userId').get(getOrders);
OrderRouter.route('/address/:orderId').get(getAddress);
OrderRouter.route('/getOrders').get(AdminVerify, getAllOrder);
OrderRouter.route('/orderstatus/:orderId').put(AdminVerify, updateOrderStatus);
OrderRouter.route('/india-order').post(indOrder);
OrderRouter.route('/cart-india-order').post(createCartINROrder);
