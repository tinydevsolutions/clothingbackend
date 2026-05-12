import Settings from '../models/Settings.js';

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('No settings found, creating default...');
      settings = await Settings.create({});
    }
    console.log('Sending settings to client:', settings.activeTheme);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    console.log('Updating settings with:', req.body);
    let settings = await Settings.findOne();
    if (settings) {
      Object.assign(settings, req.body);
      const updatedSettings = await settings.save();
      console.log('Settings updated successfully');
      res.json(updatedSettings);
    } else {
      const newSettings = await Settings.create(req.body);
      res.status(201).json(newSettings);
    }
  } catch (error) {
    next(error);
  }
};
