import { Router } from "express";
import { validationPostData } from "../middlewares/post.validation.mjs";
import postController from "../controllers/post.controller.mjs";

/* ================= Post Router ================= */
// Responsibility: handle post-related API endpoints

const postsRouter = Router();

/* ================= GET Endpoints ================= */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     responses:
 *       200:
 *         description: Success
 */
postsRouter.get("/", postController.getPosts);

// ===== Detail =====
postsRouter.get("/:postId", postController.getPostById);

// ===== Create =====
postsRouter.post("/", [validationPostData], postController.createPost);

// ===== Update =====
postsRouter.put("/:postId", postController.updatePost);

// ===== Delete =====
postsRouter.delete("/:postId", postController.deletePost);

export default postsRouter;
