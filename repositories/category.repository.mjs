import connectionPool from "../utils/db.mjs";

class CategoryRepository {
  async findAll(keyword = "") {
    const values = [];
    let whereSQL = "";

    if (keyword) {
      values.push(`%${keyword}%`);
      whereSQL = `WHERE categories.name ILIKE $${values.length}`;
    }

    const result = await connectionPool.query(`
      SELECT
        categories.id,
        categories.name,
        COUNT(posts.id)::int AS posts_count
      FROM categories
      LEFT JOIN posts ON posts.category_id = categories.id
      ${whereSQL}
      GROUP BY categories.id, categories.name
      ORDER BY categories.id ASC
    `, values);

    return result.rows;
  }

  async findById(id) {
    const result = await connectionPool.query(`
      SELECT
        categories.id,
        categories.name,
        COUNT(posts.id)::int AS posts_count
      FROM categories
      LEFT JOIN posts ON posts.category_id = categories.id
      WHERE categories.id = $1
      GROUP BY categories.id, categories.name
    `, [id]);

    return result.rows[0];
  }

  async findByName(name) {
    const result = await connectionPool.query(
      "SELECT id, name FROM categories WHERE LOWER(name) = $1",
      [name]
    );

    return result.rows[0] ?? null;
  }

  async create(name) {
    const result = await connectionPool.query(`
      INSERT INTO categories (name)
      VALUES ($1)
      RETURNING id, name
    `, [name]);

    return result.rows[0];
  }

  async update(id, name) {
    const result = await connectionPool.query(`
      UPDATE categories
      SET name = $2
      WHERE id = $1
      RETURNING id, name
    `, [id, name]);

    return result.rows[0];
  }

  async delete(id) {
    const result = await connectionPool.query(`
      DELETE FROM categories
      WHERE id = $1
      RETURNING id
    `, [id]);

    return result.rows[0];
  }

  async checkExists(id) {
    const result = await connectionPool.query(
      "SELECT 1 FROM categories WHERE id = $1",
      [id]
    );

    return result.rowCount > 0;
  }

  async countPosts(id) {
    const result = await connectionPool.query(
      "SELECT COUNT(*)::int AS total FROM posts WHERE category_id = $1",
      [id]
    );

    return result.rows[0]?.total ?? 0;
  }
}

export default new CategoryRepository();
