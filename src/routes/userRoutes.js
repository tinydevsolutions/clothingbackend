import express from 'express';
import { getUserProfile, updateUserProfile, getUsers } from '../controllers/userController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/')
  .get(protect, admin, getUsers);

export default router;
