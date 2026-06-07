import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/change-password', authenticateToken, authController.changePassword);

export default router;
