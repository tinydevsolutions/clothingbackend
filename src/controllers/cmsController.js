import Banner from '../models/Banner.js';
import HomepageSection from '../models/HomepageSection.js';

// @desc    Get active banners for frontend
// @route   GET /api/cms/banners
// @access  Public
export const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new banner
// @route   POST /api/cms/banners
// @access  Private/Admin
export const createBanner = async (req, res, next) => {
  try {
    const banner = new Banner({
      title: req.body.title || 'New Promotional Banner',
      subtitle: req.body.subtitle || 'Subtitle goes here',
      image: {
        url: req.body.image?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070',
        publicId: req.body.image?.publicId || 'default_hero'
      },
      link: req.body.link || '/shop',
      isActive: true,
    });
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all CMS sections ordered correctly
// @route   GET /api/cms/sections
// @access  Public
export const getActiveSections = async (req, res, next) => {
  try {
    const sections = await HomepageSection.find({ isActive: true })
      .populate('referencedItems.itemId')
      .sort('order');
    res.json(sections);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a banner
// @route   PUT /api/cms/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      Object.assign(banner, req.body);
      const updated = await banner.save();
      res.json(updated);
    } else {
      res.status(404);
      throw new Error('Banner not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new generic section
// @route   POST /api/cms/sections
// @access  Private/Admin
export const createSection = async (req, res, next) => {
  try {
    const sectionCount = await HomepageSection.countDocuments();
    const section = new HomepageSection({
      name: req.body.name || `New Section ${Date.now()}`,
      type: req.body.type || 'ProductGrid',
      order: sectionCount,
      content: {
        heading: req.body.type === 'ReelsCarousel' ? 'Follow Us on Instagram' : 'New Curated Collection',
        subheading: 'Update this subheading'
      },
      isActive: true,
      referencedItems: [],
      reels: []
    });
    const createdSection = await section.save();
    res.status(201).json(createdSection);
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder Sections array
// @route   PUT /api/cms/sections/reorder
// @access  Private/Admin
export const reorderSections = async (req, res, next) => {
  try {
    const { sectionIds } = req.body; // Array of IDs in new order
    if (sectionIds && sectionIds.length > 0) {
      for (const [index, id] of sectionIds.entries()) {
        await HomepageSection.findByIdAndUpdate(id, { order: index });
      }
      res.json({ message: 'Sections reordered successfully' });
    } else {
      res.status(400);
      throw new Error('No sections provided');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Update generic section content
// @route   PUT /api/cms/sections/:id
// @access  Private/Admin
export const updateSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id);
    if (section) {
      Object.assign(section, req.body);
      const updated = await section.save();
      res.json(updated);
    } else {
      res.status(404);
      throw new Error('Section not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a banner
// @route   DELETE /api/cms/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      await banner.deleteOne();
      res.json({ message: 'Banner removed' });
    } else {
      res.status(404);
      throw new Error('Banner not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a generic section
// @route   DELETE /api/cms/sections/:id
// @access  Private/Admin
export const deleteSection = async (req, res, next) => {
  try {
    const section = await HomepageSection.findById(req.params.id);
    if (section) {
      await section.deleteOne();
      res.json({ message: 'Section removed' });
    } else {
      res.status(404);
      throw new Error('Section not found');
    }
  } catch (error) {
    next(error);
  }
};
