import userService from '../services/userService.js';

class UserController {
  async getStores(req, res) {
    const { name, address, sortField, sortOrder } = req.query;
    const userId = req.user.id;

    try {
      const stores = await userService.getStoresForUser(userId, { name, address, sortField, sortOrder });
      return res.json(stores);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async submitRating(req, res) {
    const { storeOwnerId, rating } = req.body; // Wait, frontend passes storeOwnerId (which represents store_id now)
    const userId = req.user.id;

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    if (!storeOwnerId) {
      return res.status(400).json({ error: 'storeOwnerId is required.' });
    }

    try {
      await userService.submitRating({ userId, storeId: storeOwnerId, rating: parsedRating });
      return res.status(201).json({ message: 'Rating submitted successfully' });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }
  }

  async modifyRating(req, res) {
    const { rating } = req.body;
    const { storeOwnerId } = req.params; // from PUT /api/user/ratings/:storeOwnerId
    const userId = req.user.id;

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    try {
      await userService.modifyRating({ userId, storeId: storeOwnerId, rating: parsedRating });
      return res.json({ message: 'Rating updated successfully' });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new UserController();
