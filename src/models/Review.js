import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    isApproved: {
      type: Boolean,
      default: false, // Reviews shouldn't show up immediately without admin approval in premium brands
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId, isApproved: true },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: obj[0]?.averageRating || 0,
      numOfReviews: obj[0]?.numOfReviews || 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
