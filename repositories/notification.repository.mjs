import connectionPool from "../utils/db.mjs";

class NotificationRepository {
  hasEnsuredSchema = false;

  async ensureSchema() {
    if (this.hasEnsuredSchema) {
      return;
    }

    await connectionPool.query(`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES users(id)
    `);

    await connectionPool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (post_id, user_id)
      )
    `);

    this.hasEnsuredSchema = true;
  }

  async listByRecipientId(recipientUserId, role, limit = 20) {
    const normalizedLimit = Math.max(Number(limit) || 20, 1);

    const query = `
      WITH accessible_posts AS (
        SELECT
          posts.id,
          posts.title
        FROM posts
        WHERE posts.author_id = $1
          OR ($2 = 'admin' AND posts.author_id IS NULL)
      ),
      comment_notifications AS (
        SELECT
          'comment' AS type,
          comments.id::text AS source_id,
          comments.post_id AS "postId",
          accessible_posts.title AS "postTitle",
          comments.comment_text AS "commentText",
          comments.created_at AT TIME ZONE 'UTC' AS "createdAt",
          users.id AS "actorId",
          COALESCE(users.name, users.username, 'Anonymous') AS "actorName",
          users.profile_pic AS "actorAvatar"
        FROM comments
        INNER JOIN accessible_posts ON accessible_posts.id = comments.post_id
        LEFT JOIN users ON users.id = comments.user_id
        WHERE comments.user_id IS DISTINCT FROM $1
      ),
      like_notifications AS (
        SELECT
          'like' AS type,
          CONCAT(post_likes.post_id, ':', post_likes.user_id) AS source_id,
          post_likes.post_id AS "postId",
          accessible_posts.title AS "postTitle",
          NULL::text AS "commentText",
          post_likes.created_at AT TIME ZONE 'UTC' AS "createdAt",
          users.id AS "actorId",
          COALESCE(users.name, users.username, 'Anonymous') AS "actorName",
          users.profile_pic AS "actorAvatar"
        FROM post_likes
        INNER JOIN accessible_posts ON accessible_posts.id = post_likes.post_id
        LEFT JOIN users ON users.id = post_likes.user_id
        WHERE post_likes.user_id IS DISTINCT FROM $1
      )
      SELECT *
      FROM (
        SELECT * FROM comment_notifications
        UNION ALL
        SELECT * FROM like_notifications
      ) notifications
      ORDER BY "createdAt" DESC
      LIMIT $3
    `;

    const { rows } = await connectionPool.query(query, [
      recipientUserId,
      role,
      normalizedLimit,
    ]);

    return rows;
  }

  async hasUserLikedPost(postId, userId) {
    const { rowCount } = await connectionPool.query(
      `
        SELECT 1
        FROM post_likes
        WHERE post_id = $1 AND user_id = $2
      `,
      [postId, userId]
    );

    return rowCount > 0;
  }

  async addLike(postId, userId) {
    await connectionPool.query(
      `
        INSERT INTO post_likes (post_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (post_id, user_id) DO NOTHING
      `,
      [postId, userId]
    );
  }

  async removeLike(postId, userId) {
    const result = await connectionPool.query(
      `
        DELETE FROM post_likes
        WHERE post_id = $1 AND user_id = $2
      `,
      [postId, userId]
    );

    return result.rowCount > 0;
  }
}

export default new NotificationRepository();
