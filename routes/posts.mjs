import express from "express";
import connectionPool from "../utils/db.mjs";

/* ================= Router ================= */

// Responsibility: handle post-related API endpoints
const router = express.Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/posts", async (req, res) => {
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
 */
router.post("/posts", async (req, res) => {
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

export default router;
