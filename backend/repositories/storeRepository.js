import pool from '../db.js';

class StoreRepository {
  async createStore({ name, email, address, ownerId }, connection = pool) {
    const [result] = await connection.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId]
    );
    return result.insertId;
  }

  async countStores() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM stores');
    return rows[0].count;
  }

  async findStoreByOwnerId(ownerId) {
    const [rows] = await pool.query('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);
    return rows[0] || null;
  }

  async findStoreById(id) {
    const [rows] = await pool.query('SELECT * FROM stores WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async checkEmailExists(email) {
    const [rows] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    return rows.length > 0;
  }

  async findAllStoresWithRating({ name, address, sortField, sortOrder, userId }) {
    let query = `
      SELECT s.id, s.name, s.address,
             COALESCE(avg_table.avg_rating, 0) as average_rating,
             r.rating as user_rating
      FROM stores s
      LEFT JOIN (
        SELECT store_id, AVG(rating) as avg_rating
        FROM ratings
        GROUP BY store_id
      ) avg_table ON s.id = avg_table.store_id
      LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    const allowedSortFields = ['name', 'address', 'average_rating', 'user_rating'];
    const resolvedField = allowedSortFields.includes(sortField) ? sortField : 'name';
    const resolvedOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    if (resolvedField === 'average_rating') {
      query += ` ORDER BY average_rating ${resolvedOrder}`;
    } else if (resolvedField === 'user_rating') {
      query += ` ORDER BY user_rating ${resolvedOrder}`;
    } else {
      query += ` ORDER BY s.${resolvedField} ${resolvedOrder}`;
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  async findAllStoresAdmin({ name, email, address, sortField, sortOrder }) {
    let query = `
      SELECT s.id, s.name, s.email, s.address, COALESCE(avg_table.avg_rating, 0) as average_rating
      FROM stores s
      LEFT JOIN (
        SELECT store_id, AVG(rating) as avg_rating
        FROM ratings
        GROUP BY store_id
      ) avg_table ON s.id = avg_table.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    const allowedSortFields = ['name', 'email', 'address', 'average_rating'];
    const resolvedField = allowedSortFields.includes(sortField) ? sortField : 'name';
    const resolvedOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    if (resolvedField === 'average_rating') {
      query += ` ORDER BY average_rating ${resolvedOrder}`;
    } else {
      query += ` ORDER BY s.${resolvedField} ${resolvedOrder}`;
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

export default new StoreRepository();
