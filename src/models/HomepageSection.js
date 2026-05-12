import mongoose from 'mongoose';

const homepageSectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g., 'Brand Story', 'Featured Products', 'Instagram Feed'
      unique: true,
    },
    type: {
      type: String,
      default: 'ProductGrid', // ProductGrid, HTMLBlock, etc
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      required: true, // For drag-and-drop ordering
    },
    content: {
      heading: String,
      subheading: String,
      text: String,
      image: {
        url: String,
        publicId: String,
      },
    },
    // Useful for linking to specific categories / products in the section
    referencedItems: [
      {
        itemType: { type: String, enum: ['Product', 'Category'] },
        itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'referencedItems.itemType' },
      },
    ],
    // Array of Instagram Reel URLs/IDs
    reels: [String],
  },
  {
    timestamps: true,
  }
);

const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema);
export default HomepageSection;
