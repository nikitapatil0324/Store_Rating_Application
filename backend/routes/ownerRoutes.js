import express from 'express';
import ownerController from '../controllers/ownerController.js';
import { authenticateToken, authorizeRoles } from '../middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('store_owner'));

router.get('/dashboard', ownerController.getDashboard);

export default router;
