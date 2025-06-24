import { Router } from "express";
import { MessegeSubmit, SalseMessegeSubmit, getrequirement, getsalse } from "../controllers/formsubmission.controllers.js"
export const formRouter = new Router();
import {AdminVerify} from "../middlewares/Admin.middlewares.js"

formRouter.route("/requirementform").post(MessegeSubmit);
formRouter.route("/salseform").post(SalseMessegeSubmit);
formRouter.route("/getrequirement").get(AdminVerify,getrequirement);
formRouter.route("/getsalse").get(AdminVerify, getsalse);

