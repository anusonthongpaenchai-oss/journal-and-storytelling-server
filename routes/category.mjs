import { Router } from "express";

import categoryController from "../controllers/category.controller.mjs";

const categoryRouter = Router();

categoryRouter.get("/", categoryController.getCategories);
categoryRouter.get("/:categoryId", categoryController.getCategoryById);
categoryRouter.post("/", categoryController.createCategory);
categoryRouter.put("/:categoryId", categoryController.updateCategory);
categoryRouter.delete("/:categoryId", categoryController.deleteCategory);

export default categoryRouter;
