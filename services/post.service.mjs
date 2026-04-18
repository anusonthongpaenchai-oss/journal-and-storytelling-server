import notificationRepository from "../repositories/notification.repository.mjs";
import postRepository from "../repositories/post.repository.mjs";

class PostService {
  async getPosts(page = 1, limit = 6, filters = {}) {
    await notificationRepository.ensureSchema();

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
    if (normalizedFilters.status) {
      normalizedFilters.status = normalizedFilters.status.trim().toLowerCase();
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
    await notificationRepository.ensureSchema();

    /* ================= Existence Check ================= */
    const post = await postRepository.findById(id);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  }

  async createPost(data) {
    await notificationRepository.ensureSchema();

    const {
      image,
      title,
      content,
      category_id,
      category,
      description,
      status_id,
      author_id
    } = data;

    /* ================= Category Processing ================= */
    // Prefer category_id from payload; fallback to category name for backward compatibility.
    let categoryId = category_id ?? null;
    if (categoryId === null && category) {
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
      status_id,
      author_id
    });
  }

  async updatePost(id, data) {
    await notificationRepository.ensureSchema();

    const {
      image,
      title,
      content,
      category,
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

    let categoryId = category_id ?? null;
    if ((categoryId === null || categoryId === undefined) && category) {
      const normalizedCategory = category.trim().toLowerCase();
      categoryId = await postRepository.findCategoryIdByName(normalizedCategory);
    }

    return await postRepository.update(id, {
      image,
      title,
      content,
      description,
      category_id: categoryId,
      status_id
    });
  }

  async deletePost(id) {
    await notificationRepository.ensureSchema();

    /* ================= Existence Check ================= */
    const exists = await postRepository.checkExists(id);
    if (!exists) {
      throw new Error("Post not found");
    }

    return await postRepository.delete(id);
  }

  async getLikeCount(id) {
    await notificationRepository.ensureSchema();

    const exists = await postRepository.checkExists(id);
    if (!exists) {
      throw new Error("Post not found");
    }

    const result = await postRepository.getLikeCount(id);
    return { postId: Number(id), likesCount: result.likes_count ?? 0 };
  }

  async incrementLikeCount(id, userId) {
    const exists = await postRepository.checkExists(id);
    if (!exists) {
      throw new Error("Post not found");
    }

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await notificationRepository.ensureSchema();
    const hasUserLiked = await notificationRepository.hasUserLikedPost(id, userId);
    if (hasUserLiked) {
      const result = await postRepository.getLikeCount(id);
      return { postId: Number(id), likesCount: result.likes_count ?? 0 };
    }

    await notificationRepository.addLike(id, userId);
    const result = await postRepository.incrementLikeCount(id);
    return { postId: result.id, likesCount: result.likes_count };
  }

  async decrementLikeCount(id, userId) {
    const exists = await postRepository.checkExists(id);
    if (!exists) {
      throw new Error("Post not found");
    }

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await notificationRepository.ensureSchema();
    const removed = await notificationRepository.removeLike(id, userId);
    if (!removed) {
      const result = await postRepository.getLikeCount(id);
      return { postId: Number(id), likesCount: result.likes_count ?? 0 };
    }

    const result = await postRepository.decrementLikeCount(id);
    return { postId: result.id, likesCount: result.likes_count };
  }
}

export default new PostService();
