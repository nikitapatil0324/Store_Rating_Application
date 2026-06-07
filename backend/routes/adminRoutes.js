import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.post('/users', adminController.createUser);
router.get('/dashboard', adminController.getDashboardStats);
router.get('/listings', adminController.getListings);
router.get('/users/:id', adminController.getUserDetails);

export default router;
