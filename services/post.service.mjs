import postRepository from "../repositories/post.repository.mjs";

class PostService {
  async getPosts(page = 1, limit = 6, filters = {}) {
    /* ================= Pagination Logic ================= */
    // Business logic: validate and normalize pagination
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.max(parseInt(limit) || 6, 1);
    const offset = (page - 1) * limit;

    /* ================= Filter Processing ================= */
    const normalizedFilters = { ...filters };
    if (normalizedFilters.category) {
      normalizedFilters.category = normalizedFilters.category.trim().toLowerCase();
    }

    /* ================= Data Fetching ================= */
    // Business logic: get data and count concurrently
    const [posts, totalPosts] = await Promise.all([
      postRepository.findAll(normalizedFilters, { limit, offset }),
      postRepository.count(normalizedFilters)
    ]);

    /* ================= Pagination Result ================= */
    const totalPages = Math.ceil(totalPosts / limit);

    return {
      totalPosts,
      totalPages,
      currentPage: page,
      limit,
      posts,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async getPostById(id) {
    /* ================= Existence Check ================= */
    const post = await postRepository.findById(id);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  }

  async createPost(data) {
    const {
      image,
      title,
      content,
      category,
      description,
      status_id
    } = data;

    /* ================= Category Processing ================= */
    // Business logic: category name to id conversion
    let categoryId = null;
    if (category) {
      const normalizedCategory = category.trim().toLowerCase();
      categoryId = await postRepository.findCategoryIdByName(normalizedCategory);
    }

    /* ================= Persistence ================= */
    // Call repository with processed data
    return await postRepository.create({
      title,
      image,
      content,
      category_id: categoryId,
      description,
      status_id
    });
  }

  async updatePost(id, data) {
    const {
      image,
      title,
      content,
      category_id,
      description,
      status_id
    } = data;

    /* ================= Validation ================= */
    if (status_id !== undefined && ![1, 2].includes(Number(status_id))) {
      throw new Error("Status id must be [1, 2]");
    }

    /* ================= Existence Check ================= */
    const exists = await postRepository.checkExists(id);
    if (!exists) {
      throw new Error("Post not found");
    }

    return await postRepository.update(id, {
      image,
      title,
      content,
      description,
      category_id,
      status_id
    });
  }

  async deletePost(id) {
    /* ================= Existence Check ================= */
    const exists = await postRepository.checkExists(id);
    if (!exists) {
      throw new Error("Post not found");
    }

    return await postRepository.delete(id);
  }
}

export default new PostService();
