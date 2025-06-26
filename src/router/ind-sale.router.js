import { Router } from "express"
import { submitSaleMessage, getSale } from "../controllers/ind-salse.controllers.js";
export const saleRouter = Router();

saleRouter.route("/submitsale").post(submitSaleMessage);
saleRouter.route("/getsale").get(getSale);