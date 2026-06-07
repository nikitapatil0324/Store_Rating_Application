import adminService from '../services/adminService.js';
import { validateUserFields } from './authController.js';

class AdminController {
  async getDashboardStats(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      return res.json(stats);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getListings(req, res) {
    const { type, name, email, address, role, sortField, sortOrder } = req.query;

    try {
      const listings = await adminService.getListings({
        type,
        name,
        email,
        address,
        role,
        sortField,
        sortOrder
      });
      return res.json(listings);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createUser(req, res) {
    const { name, email, password, address, role } = req.body;

    const validationError = validateUserFields({ name, email, password, address });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (!['admin', 'user', 'store_owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role selection' });
    }

    try {
      const result = await adminService.createUser({ name, email, password, address, role });
      return res.status(201).json({ message: 'User created successfully', userId: result.userId });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }
  }

  async getUserDetails(req, res) {
    const { id } = req.params;

    try {
      const userDetails = await adminService.getUserDetails(id);
      return res.json(userDetails);
    } catch (err) {
      console.error(err);
      return res.status(404).json({ error: err.message });
    }
  }
}

export default new AdminController();
