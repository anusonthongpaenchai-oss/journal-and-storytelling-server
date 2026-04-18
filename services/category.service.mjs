import categoryRepository from "../repositories/category.repository.mjs";

class CategoryService {
  async getCategories(keyword = "") {
    const normalizedKeyword = typeof keyword === "string" ? keyword.trim() : "";
    const categories = await categoryRepository.findAll(normalizedKeyword);

    return {
      categories,
    };
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  async createCategory(data) {
    const normalizedName = this.normalizeName(data?.name);
    const existingCategory = await categoryRepository.findByName(normalizedName.toLowerCase());

    if (existingCategory) {
      throw new Error("Category already exists");
    }

    return await categoryRepository.create(normalizedName);
  }

  async updateCategory(id, data) {
    const exists = await categoryRepository.checkExists(id);
    if (!exists) {
      throw new Error("Category not found");
    }

    const normalizedName = this.normalizeName(data?.name);
    const existingCategory = await categoryRepository.findByName(normalizedName.toLowerCase());

    if (existingCategory && String(existingCategory.id) !== String(id)) {
      throw new Error("Category already exists");
    }

    return await categoryRepository.update(id, normalizedName);
  }

  async deleteCategory(id) {
    const exists = await categoryRepository.checkExists(id);
    if (!exists) {
      throw new Error("Category not found");
    }

    const postsCount = await categoryRepository.countPosts(id);
    if (postsCount > 0) {
      throw new Error("Category is in use");
    }

    return await categoryRepository.delete(id);
  }

  normalizeName(name) {
    if (typeof name !== "string") {
      throw new Error("Category name must be a string");
    }

    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error("Category name is required");
    }

    return normalizedName;
  }
}

export default new CategoryService();
