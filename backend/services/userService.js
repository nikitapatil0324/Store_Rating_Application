import storeRepository from '../repositories/storeRepository.js';
import ratingRepository from '../repositories/ratingRepository.js';

class UserService {
  async getStoresForUser(userId, { name, address, sortField, sortOrder }) {
    return await storeRepository.findAllStoresWithRating({
      userId,
      name,
      address,
      sortField,
      sortOrder
    });
  }

  async submitRating({ userId, storeId, rating }) {
    // 1. Verify store exists
    const store = await storeRepository.findStoreById(storeId);
    if (!store) {
      throw new Error('Store not found.');
    }

    const existing = await ratingRepository.findRatingByUserAndStore(userId, storeId);
    if (existing) {
      throw new Error('You have already rated this store. Please modify it instead.');
    }

    return await ratingRepository.createRating({ userId, storeId, rating });
  }

  async modifyRating({ userId, storeId, rating }) {
    // Verify rating exists
    const existing = await ratingRepository.findRatingByUserAndStore(userId, storeId);
    if (!existing) {
      throw new Error('Rating does not exist.');
    }

    return await ratingRepository.updateRating({ userId, storeId, rating });
  }
}

export default new UserService();
