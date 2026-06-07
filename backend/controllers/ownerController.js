import ownerService from '../services/ownerService.js';

class OwnerController {
  async getDashboard(req, res) {
    const ownerId = req.user.id;

    try {
      const data = await ownerService.getStoreDashboardData(ownerId);
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}

export default new OwnerController();
