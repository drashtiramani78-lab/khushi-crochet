import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Variant name is required"],
    minlength: [1, "Variant name cannot be empty"],
    maxlength: [50, "Variant name cannot exceed 50 characters"],
  },
  options: [
    {
      type: String,
      minlength: [1, "Option cannot be empty"],
      maxlength: [50, "Option cannot exceed 50 characters"],
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [200, "Product name cannot exceed 200 characters"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0.01, "Price must be greater than 0"],
      validate: {
        validator: (v) => v !== null && v !== undefined && !isNaN(v),
        message: "Price must be a valid number",
      },
    },
    image: { type: String, default: "" },
    description: {
      type: String,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    inventory: {
      type: Number,
      default: 0,
      required: [true, "Inventory is required"],
      min: [0, "Inventory cannot be negative"],
      validate: {
        validator: (v) => Number.isInteger(v),
        message: "Inventory must be a whole number",
      },
    },
    category: {
      type: String,
      default: "",
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      default: "",
      lowercase: true,
      validate: {
        validator: (v) => v === "" || /^[a-z0-9-]+$/.test(v),
        message: "Slug must only contain lowercase letters, numbers, and hyphens",
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    variants: [variantSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
