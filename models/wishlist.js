import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "User ID is required"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, "Product ID is required"],
    },
    productName: {
      type: String,
      default: "",
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    productPrice: {
      type: Number,
      default: 0,
      min: [0, "Product price cannot be negative"],
    },
    productImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
