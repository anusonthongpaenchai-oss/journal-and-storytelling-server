import { Router } from "express";
import connectionPool from "../utils/db.mjs";

/* ================= Router ================= */

// Responsibility: handle post-related API endpoints
const postsRouter = Router()

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     responses:
 *       200:
 *         description: Success
 */
postsRouter.get("/", async (req, res) => {
  try {
    const results = await connectionPool.query("SELECT * FROM posts");

    res.status(200).json({
      data: results.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server could not fetch posts",
    });
  }
});

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create new post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *               - category_id
 *               - content
 *               - status_id
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               status_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Created post successfully
 *       400:
 *         description: Missing required fields from client
 *       500:
 *         description: Server error
 */
postsRouter.post("/", async (req, res) => {
  const {
    title,
    image,
    category_id,
    description,
    content,
    status_id,
  } = req.body;

  // Basic request validation
  if (!title || !category_id || !content || !status_id || !image) {
    return res.status(400).json({
      message: "Missing required fields from client",
    });
  }

  try {
    await connectionPool.query(
      `
        INSERT INTO posts (
          title,
          image,
          category_id,
          description,
          content,
          status_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [title, image, category_id, description, content, status_id]
    );

    res.status(201).json({
      message: "Created post successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
});

export default postsRouter;
