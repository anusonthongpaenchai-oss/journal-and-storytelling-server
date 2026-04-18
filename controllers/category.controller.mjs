import categoryService from "../services/category.service.mjs";

class CategoryController {
  async getCategories(req, res) {
    try {
      const { keyword } = req.query;
      const result = await categoryService.getCategories(keyword);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Get categories error:", error);
      return res.status(500).json({
        message: "Server could not read categories due to database connection",
      });
    }
  }

  async getCategoryById(req, res) {
    try {
      const categoryId = req.params.categoryId;
      const result = await categoryService.getCategoryById(categoryId);

      return res.status(200).json(result);
    } catch (error) {
      if (error.message === "Category not found") {
        return res.status(404).json({
          message: "Server could not find a requested category",
        });
      }

      console.error("Get category error:", error);
      return res.status(500).json({
        message: "Server could not read category due to database connection",
      });
    }
  }

  async createCategory(req, res) {
    try {
      const category = await categoryService.createCategory(req.body);

      return res.status(201).json({
        message: "Created category successfully",
        category,
      });
    } catch (error) {
      if (error.message === "Category already exists") {
        return res.status(409).json({
          message: "Category already exists",
        });
      }

      if (
        error.message === "Category name must be a string" ||
        error.message === "Category name is required"
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      console.error("Create category error:", error);
      return res.status(500).json({
        message: "Server could not create category due to database connection",
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const categoryId = req.params.categoryId;
      const category = await categoryService.updateCategory(categoryId, req.body);

      return res.status(200).json({
        message: "Updated category successfully",
        category,
      });
    } catch (error) {
      if (error.message === "Category not found") {
        return res.status(404).json({
          message: "Server could not find a requested category to update",
        });
      }

      if (error.message === "Category already exists") {
        return res.status(409).json({
          message: "Category already exists",
        });
      }

      if (
        error.message === "Category name must be a string" ||
        error.message === "Category name is required"
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      console.error("Update category error:", error);
      return res.status(500).json({
        message: "Server could not update category due to database connection",
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const categoryId = req.params.categoryId;
      await categoryService.deleteCategory(categoryId);

      return res.status(200).json({
        message: "Deleted category successfully",
      });
    } catch (error) {
      if (error.message === "Category not found") {
        return res.status(404).json({
          message: "Server could not find a requested category to delete",
        });
      }

      if (error.message === "Category is in use") {
        return res.status(400).json({
          message: "Category is currently used by articles and cannot be deleted",
        });
      }

      console.error("Delete category error:", error);
      return res.status(500).json({
        message: "Server could not delete category due to database connection",
      });
    }
  }
}

export default new CategoryController();
