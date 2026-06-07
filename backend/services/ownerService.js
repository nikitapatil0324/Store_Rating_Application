import storeRepository from '../repositories/storeRepository.js';
import ratingRepository from '../repositories/ratingRepository.js';

class OwnerService {
  async getStoreDashboardData(ownerId) {
    const store = await storeRepository.findStoreByOwnerId(ownerId);
    if (!store) {
      throw new Error('Associated store profile not found.');
    }

    const avgRating = await ratingRepository.findStoreAverageRating(store.id);

    const ratings = await ratingRepository.findRatersByStoreId(store.id);

    return {
      averageRating: parseFloat(avgRating).toFixed(1),
      ratings
    };
  }
}

export default new OwnerService();
