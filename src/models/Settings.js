import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'clothing.demo',
    },
    announcementBar: {
      isActive: { type: Boolean, default: false },
      text: String,
      link: String,
    },
    footerLinks: [
      {
        title: String,
        url: String,
      },
    ],
    socialMedia: {
      instagram: String,
      whatsapp: String,
      facebook: String,
    },
    address: String,
    contactEmail: String,
    contactPhone: String,
    policies: {
      shipping: String,
      Returns: String,
    },
    activeTheme: {
      type: String,
      default: 'theme-classic-pearl',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
