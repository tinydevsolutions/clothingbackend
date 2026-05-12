import express from 'express';
import { upload } from '../utils/cloudinary.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({
      url: req.file.path,
      publicId: req.file.filename,
      message: 'Image uploaded successfully'
    });
  } else {
    res.status(400).json({ success: false, message: 'Image upload failed' });
  }
});

// For multiple image uploads (product variants/gallery)
router.post('/multiple', protect, admin, upload.array('images', 5), (req, res) => {
  if (req.files && req.files.length > 0) {
    const uploadedImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
    res.json({ images: uploadedImages, message: 'Images uploaded successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Multiple images upload failed' });
  }
});

export default router;
