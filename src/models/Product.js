import mongoose from 'mongoose';
import './Category.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: String,
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    templateType: {
      type: String,
      enum: ['Kurti', 'Dress', 'Coord Set', 'Saree', 'Standard'],
      default: 'Standard',
    },
    variants: [
      {
        size: { type: String },
        color: { type: String },
        sku: { type: String },
        stock: { type: Number, default: 0 },
        priceAdjustment: { type: Number, default: 0 },
      },
    ],
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    baseStock: {
      type: Number,
      default: 0,
    },
    washCare: String,
    deliveryInfo: String,
    returnPolicy: String,
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Archived'],
      default: 'Draft',
    },
    flags: {
      isFeatured: { type: Boolean, default: false },
      isNewArrival: { type: Boolean, default: false },
      isBestSeller: { type: Boolean, default: false },
    },
    seo: {
      title: String,
      metaDescription: String,
      keywords: [String],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Slug generator
productSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
