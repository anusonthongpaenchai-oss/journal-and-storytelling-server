import postService from "../services/post.service.mjs";

class PostController {
  // ===== Get Posts =====
  // Responsibility: retrieve posts with optional pagination and filters
  async getPosts(req, res) {
    try {
      const { page, limit, category, keyword } = req.query;

      const result = await postService.getPosts(page, limit, { category, keyword });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Get posts error:", error);
      return res.status(500).json({
        message: "Server could not read post due to database connection"
      });
    }
  }

  // ===== Get Post By Id =====
  // Responsibility: retrieve a single post by route param
  async getPostById(req, res) {
    try {
      const postId = req.params.postId;
      const result = await postService.getPostById(postId);

      return res.status(200).json(result);
    } catch (error) {
      /* ================= Error Handling ================= */
      if (error.message === "Post not found") {
        return res.status(404).json({
          message: "Server could not find a requested post"
        });
      }

      console.error("Get post error:", error);
      return res.status(500).json({
        message: "Server could not read post due to database connection"
      });
    }
  }

  // ===== Create Post =====
  // Responsibility: create a new post from request payload
  async createPost(req, res) {
    try {
      await postService.createPost(req.body);

      return res.status(201).json({
        message: "Created post successfully"
      });
    } catch (error) {
      console.error("Create post error:", error);
      return res.status(500).json({
        message: "Server could not create post due to database connection"
      });
    }
  }

  // ===== Update Post =====
  // Responsibility: update a post by id and validate business rules
  async updatePost(req, res) {
    try {
      const postId = req.params.postId;
      await postService.updatePost(postId, req.body);

      return res.status(200).json({
        message: "Updated post successfully"
      });
    } catch (error) {
      /* ================= Error Handling ================= */
      if (error.message === "Post not found") {
        return res.status(404).json({
          message: "Server could not find a requested post to update"
        });
      }

      if (error.message === "Status id must be [1, 2]") {
        return res.status(400).json({
          message: "Status id must be [1, 2]"
        });
      }

      console.error("Update post error:", error);
      return res.status(500).json({
        message: "Server could not update post due to database connection"
      });
    }
  }

  // ===== Delete Post =====
  // Responsibility: delete a post by id
  async deletePost(req, res) {
    try {
      const postId = req.params.postId;
      await postService.deletePost(postId);

      return res.status(200).json({
        message: "Deleted post successfully"
      });
    } catch (error) {
      /* ================= Error Handling ================= */
      if (error.message === "Post not found") {
        return res.status(404).json({
          message: "Server could not find a requested post to delete"
        });
      }

      console.error("Delete post error:", error);
      return res.status(500).json({
        message: "Server could not delete post due to database connection"
      });
    }
  }
}

export default new PostController();
