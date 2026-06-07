import express from 'express';
import userController from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('user'));

router.get('/stores', userController.getStores);
router.post('/ratings', userController.submitRating);
router.put('/ratings/:storeOwnerId', userController.modifyRating);

export default router;
