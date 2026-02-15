import { Router } from "express";
import connectionPool, { isDbConfigured } from "../utils/db.mjs";
import protectUser from "../middlewares/protectUser.mjs";

const commentRouter = Router();

commentRouter.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;

  if (!isDbConfigured) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!postId || Number.isNaN(Number(postId))) {
    return res.status(400).json({ error: "Invalid post id" });
  }

  try {
    const query = `
      SELECT
        comments.id,
        comments.post_id AS "postId",
        comments.user_id AS "userId",
        comments.comment_text AS "commentText",
        comments.created_at AT TIME ZONE 'UTC' AS "createdAt",
        users.username,
        users.name,
        users.profile_pic AS "profilePic"
      FROM comments
      LEFT JOIN users ON users.id = comments.user_id
      WHERE comments.post_id = $1
      ORDER BY comments.created_at DESC
    `;
    const values = [postId];
    const { rows } = await connectionPool.query(query, values);

    return res.status(200).json({ comments: rows });
  } catch (error) {
    return res.status(500).json({ error: "Failed to get comments" });
  }
});

commentRouter.post("/", protectUser, async (req, res) => {
  const { post_id, comment_text } = req.body;
  const user_id = req.user?.id;

  if (!isDbConfigured) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!post_id || Number.isNaN(Number(post_id))) {
    return res.status(400).json({ error: "post_id must be a number" });
  }

  if (!comment_text || !comment_text.trim()) {
    return res.status(400).json({ error: "comment_text is required" });
  }

  try {
    const postCheck = await connectionPool.query(
      "SELECT 1 FROM posts WHERE id = $1",
      [post_id]
    );

    if (postCheck.rowCount === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const insertQuery = `
      INSERT INTO comments (post_id, user_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        post_id AS "postId",
        user_id AS "userId",
        comment_text AS "commentText",
        created_at AS "createdAt"
    `;
    const insertValues = [post_id, user_id, comment_text.trim()];
    const { rows } = await connectionPool.query(insertQuery, insertValues);

    return res.status(201).json({
      message: "Comment created successfully",
      comment: rows[0],
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create comment" });
  }
});

export default commentRouter;
