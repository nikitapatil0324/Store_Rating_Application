import pool from '../db.js';

class RatingRepository {
  async createRating({ userId, storeId, rating }) {
    const [result] = await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, rating]
    );
    return result.insertId;
  }

  async updateRating({ userId, storeId, rating }) {
    const [result] = await pool.query(
      'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
      [rating, userId, storeId]
    );
    return result.affectedRows > 0;
  }

  async countRatings() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM ratings');
    return rows[0].count;
  }

  async findRatingByUserAndStore(userId, storeId) {
    const [rows] = await pool.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    return rows[0] || null;
  }

  async findStoreAverageRating(storeId) {
    const [rows] = await pool.query(
      'SELECT COALESCE(AVG(rating), 0) as avgRating FROM ratings WHERE store_id = ?',
      [storeId]
    );
    return rows[0].avgRating;
  }

  async findRatersByStoreId(storeId) {
    const [rows] = await pool.query(`
      SELECT r.rating, r.created_at, u.name, u.email, u.address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);
    return rows;
  }
}

export default new RatingRepository();
