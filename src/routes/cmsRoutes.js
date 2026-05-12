import express from 'express';
import {
  getActiveBanners,
  createBanner,
  getActiveSections,
  createSection,
  updateBanner,
  reorderSections,
  updateSection,
  deleteBanner,
  deleteSection
} from '../controllers/cmsController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/banners')
  .get(getActiveBanners)
  .post(protect, admin, createBanner);

router.route('/banners/:id')
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

router.route('/sections')
  .get(getActiveSections)
  .post(protect, admin, createSection);

router.route('/sections/reorder')
  .put(protect, admin, reorderSections);

router.route('/sections/:id')
  .put(protect, admin, updateSection)
  .delete(protect, admin, deleteSection);

export default router;
