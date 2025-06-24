import Router from "express";
import { updatecharge , getcharge } from "../controllers/deliveryChrage.controllers.js";

export const deliveryRouter = Router();

deliveryRouter.route("/update-deliverycharge").put(updatecharge);
deliveryRouter.route("/getcharge").get(getcharge);