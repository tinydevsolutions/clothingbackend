import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: String,
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    link: String,
    ctaText: {
      type: String,
      default: 'Shop Now',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
