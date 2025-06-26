import Router from "express";
import { updatecharge , getcharge } from "../controllers/deliveryChrage.controllers.js";
import { AdminVerify } from "../middlewares/Admin.middlewares.js";
export const deliveryRouter = Router();

deliveryRouter.route("/update-deliverycharge").put(AdminVerify,updatecharge);
deliveryRouter.route("/getcharge").get(AdminVerify,getcharge);