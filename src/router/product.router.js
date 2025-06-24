import { Router } from "express";
import {upload }from "../middlewares/multer-middlewares.js"
import {AdminVerify} from "../middlewares/Admin.middlewares.js";
import { addRating } from "../controllers/Product.controllers.js";
import {getProductById} from "../controllers/Product.controllers.js"

import {
    productController,
    getAllProducts,
    updateProduct,
    deleteProduct
} from "../controllers/Product.controllers.js"

export const productRouter = new Router();


productRouter.route("/add").post(AdminVerify,
    upload.array("images", 5),
    productController
);

productRouter.get('/get-product/:id',getProductById)

productRouter.delete("/delete-product/:id", AdminVerify , deleteProduct);
productRouter.get("/get-all",getAllProducts);
productRouter.put("/update-product/:id", AdminVerify ,upload.array("images",5),updateProduct);
productRouter.put("/rate/:productId", addRating);
