import Router from "express";
import { addItemToWishList, deletWishListitem, getWishListItem, moveWishlistToCart } from "../controllers/whishlist.controllers.js";

export const WishlistRouter = new Router();

WishlistRouter.route("/add-to-wishlist/:userId/:productId").post(addItemToWishList);
WishlistRouter.route("/delete-to-wishlist/:userId/:productId").delete(deletWishListitem);
WishlistRouter.route("/getwhishlistItem/:userId").get(getWishListItem);
WishlistRouter.route("/movetocart").post(moveWishlistToCart)

