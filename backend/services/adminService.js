import userRepository from '../repositories/userRepository.js';
import storeRepository from '../repositories/storeRepository.js';
import ratingRepository from '../repositories/ratingRepository.js';
import authService from './authService.js';

class AdminService {
  async getDashboardStats() {
    const totalUsers = await userRepository.countUsers();
    const totalStores = await storeRepository.countStores();
    const totalRatings = await ratingRepository.countRatings();

    return {
      totalUsers,
      totalStores,
      totalRatings
    };
  }

  async getListings({ type, name, email, address, role, sortField, sortOrder }) {
    if (type === 'stores') {
      return await storeRepository.findAllStoresAdmin({ name, email, address, sortField, sortOrder });
    } else {
      return await userRepository.findAllUsers({ name, email, address, role, sortField, sortOrder });
    }
  }

  async createUser({ name, email, password, address, role }) {
    // Reuse authService register logic as it handles transaction, unique constraints, and hashing
    return await authService.register({ name, email, password, address, role });
  }

  async getUserDetails(id) {
    const user = await userRepository.findUserDetailById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

export default new AdminService();
