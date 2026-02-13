import connectionPool from "../utils/db.mjs";

class PostRepository {
  async findAll(filters = {}, pagination = {}) {
    const { category, keyword } = filters;
    const { limit, offset } = pagination;

    /* ================= Query Building ================= */
    const whereConditions = [];
    const values = [];

    if (category) {
      values.push(category);
      whereConditions.push(`LOWER(categories.name) = $${values.length}`);
    }

    if (keyword) {
      values.push(`%${keyword}%`);
      whereConditions.push(`
        (
          posts.title ILIKE $${values.length}
          OR posts.description ILIKE $${values.length}
          OR posts.content ILIKE $${values.length}
        )
      `);
    }

    const whereSQL = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(" AND ")}` : "";

    /* ================= Query Execution ================= */
    values.push(limit, offset);

    const result = await connectionPool.query(`
      SELECT
        posts.id,
        posts.image,
        posts.title,
        posts.description,
        posts.content,
        posts.date,
        posts.likes_count,
        categories.name AS category
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ${whereSQL}
      ORDER BY posts.id ASC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `, values);

    return result.rows;
  }

  async count(filters = {}) {
    const { category, keyword } = filters;

    /* ================= Query Building ================= */
    const whereConditions = [];
    const values = [];

    if (category) {
      values.push(category);
      whereConditions.push(`LOWER(categories.name) = $${values.length}`);
    }

    if (keyword) {
      values.push(`%${keyword}%`);
      whereConditions.push(`
        (
          posts.title ILIKE $${values.length}
          OR posts.description ILIKE $${values.length}
          OR posts.content ILIKE $${values.length}
        )
      `);
    }

    const whereSQL = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const result = await connectionPool.query(`
      SELECT COUNT(*) 
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      ${whereSQL}
    `, values);

    return parseInt(result.rows[0].count);
  }

  async findById(id) {
    const result = await connectionPool.query(`
      SELECT
        posts.id,
        posts.image,
        posts.title,
        posts.description,
        posts.content,
        posts.date,
        posts.likes_count,
        categories.name AS category,
        statuses.status AS status
      FROM posts
      LEFT JOIN categories ON posts.category_id = categories.id
      LEFT JOIN statuses ON posts.status_id = statuses.id
      WHERE posts.id = $1
    `, [id]);

    return result.rows[0];
  }

  async create(data) {
    const {
      title,
      image,
      content,
      category_id,
      description,
      status_id
    } = data;

    const result = await connectionPool.query(`
      INSERT INTO posts (
        title,
        image,
        content,
        category_id,
        description,
        status_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      title,
      image,
      content,
      category_id ?? null,
      description ?? null,
      status_id ?? null,
    ]);

    return result.rows[0];
  }

  async update(id, data) {
    const {
      image,
      title,
      content,
      description,
      category_id,
      status_id
    } = data;

    const result = await connectionPool.query(`
      UPDATE posts
      SET
        image = COALESCE($2, image),
        title = COALESCE($3, title),
        content = COALESCE($4, content),
        description = COALESCE($5, description),
        category_id = COALESCE($6, category_id),
        status_id = COALESCE($7, status_id)
      WHERE id = $1
      RETURNING id
    `, [
      id,
      image ?? null,
      title ?? null,
      content ?? null,
      description ?? null,
      category_id ?? null,
      status_id ?? null,
    ]);

    return result.rows[0];
  }

  async delete(id) {
    const result = await connectionPool.query(`
      DELETE FROM posts
      WHERE id = $1
      RETURNING id
    `, [id]);

    return result.rows[0];
  }

  async checkExists(id) {
    const result = await connectionPool.query(
      "SELECT 1 FROM posts WHERE id = $1",
      [id]
    );

    return result.rowCount > 0;
  }

  async findCategoryIdByName(categoryName) {
    const result = await connectionPool.query(
      "SELECT id FROM categories WHERE LOWER(name) = $1",
      [categoryName]
    );

    return result.rowCount > 0 ? result.rows[0].id : null;
  }
}

export default new PostRepository();
