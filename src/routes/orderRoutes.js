import express from 'express';
import {
  addOrderItems,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  getDashboardStats,
  getRazorpayKey
} from '../controllers/orderController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats/dashboard', protect, admin, getDashboardStats);
router.get('/config/razorpay', protect, getRazorpayKey);

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id/pay')
  .post(protect, updateOrderToPaid);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

export default router;
