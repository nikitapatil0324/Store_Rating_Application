import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import userRepository from '../repositories/userRepository.js';
import storeRepository from '../repositories/storeRepository.js';

class AuthService {
  async register({ name, email, password, address, role }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email is already registered.');
    }

    if (role === 'store_owner') {
      const existingStoreEmail = await storeRepository.checkEmailExists(email);
      if (existingStoreEmail) {
        throw new Error('Email is already registered to a store.');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const resolvedRole = ['admin', 'user', 'store_owner'].includes(role) ? role : 'user';

    if (resolvedRole === 'store_owner') {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const ownerId = await userRepository.createUser(
          { name, email, password: hashedPassword, address, role: resolvedRole },
          connection
        );

        await storeRepository.createStore(
          { name, email, address, ownerId },
          connection
        );

        await connection.commit();
        return { userId: ownerId };
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } else {
      const userId = await userRepository.createUser({
        name,
        email,
        password: hashedPassword,
        address,
        role: resolvedRole
      });
      return { userId };
    }
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    };
  }

  async changePassword(userId, { oldPassword, newPassword }) {
    const user = await userRepository.findByEmail(
      (await userRepository.findById(userId)).email
    );
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Incorrect current password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    return await userRepository.updatePassword(userId, hashedNewPassword);
  }
}

export default new AuthService();
