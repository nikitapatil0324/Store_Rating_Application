import pool from '../db.js';

class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await pool.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async createUser({ name, email, password, address, role }, connection = pool) {
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, address, role]
    );
    return result.insertId;
  }

  async updatePassword(id, hashedPassword) {
    const [result] = await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return result.affectedRows > 0;
  }

  async countUsers() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role IN ("admin", "user")');
    return rows[0].count;
  }

  async findAllUsers({ name, email, address, role, sortField, sortOrder }) {
    let query = 'SELECT id, name, email, address, role FROM users WHERE role IN ("admin", "user")';
    const params = [];

    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    const allowedSortFields = ['name', 'email', 'address', 'role'];
    const resolvedField = allowedSortFields.includes(sortField) ? sortField : 'name';
    const resolvedOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${resolvedField} ${resolvedOrder}`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  async findUserDetailById(id) {
    const query = `
      SELECT u.id, u.name, u.email, u.address, u.role, COALESCE(avg_table.avg_rating, 0) as average_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN (
        SELECT store_id, AVG(rating) as avg_rating
        FROM ratings
        GROUP BY store_id
      ) avg_table ON s.id = avg_table.store_id
      WHERE u.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }
}

export default new UserRepository();
