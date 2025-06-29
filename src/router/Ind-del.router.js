import Router from 'express';
import { updateIndCharge, getIndCharge } from '../controllers/indian-del-charge.controllers.js';
import { AdminVerify } from '../middlewares/Admin.middlewares.js';
export const inddelRouter = Router();

inddelRouter.route('/addindcharge').put(AdminVerify, updateIndCharge);
inddelRouter.route('/getingcharge').get(getIndCharge);
