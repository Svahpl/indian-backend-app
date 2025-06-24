import { Router } from "express";
import { comment } from "../models/comment.models.js";
import { addComment, getCommentsByProduct } from "../controllers/comment.controller.js";

export const commentRouter = Router();

commentRouter.route("/addcomment").post(addComment);
commentRouter.route("/getcomment/:productId").post(getCommentsByProduct);
