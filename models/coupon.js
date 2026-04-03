import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    discountType: {
      type: String,
      enum: {
        values: ['percentage', 'fixed'],
        message: "Discount type must be either 'percentage' or 'fixed'",
      },
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator: function(v) {
          // For percentage, max is 100
          if (this.discountType === 'percentage') {
            return v <= 100;
          }
          return true;
        },
        message: "Percentage discount cannot exceed 100",
      },
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maxDiscount: {
      type: Number,
      default: null,
      validate: [
        {
          validator: (v) => v === null || v > 0,
          message: "Max discount must be greater than 0",
        },
      ],
    },
    usageLimit: {
      type: Number,
      default: null,
      validate: [
        {
          validator: (v) => v === null || v > 0,
          message: "Usage limit must be greater than 0",
        },
      ],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, "Per-user limit must be at least 1"],
    },
    usedBy: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        usedCount: {
          type: Number,
          default: 0,
          min: [0, "Used count cannot be negative"],
        },
      },
    ],
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validTill: {
      type: Date,
      required: [true, "Valid till date is required"],
      validate: {
        validator: function(v) {
          return v > this.validFrom;
        },
        message: "Valid till date must be after valid from date",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableProducts: [mongoose.Schema.Types.ObjectId],
    applicableCategories: [
      {
        type: String,
        maxlength: [100, "Category cannot exceed 100 characters"],
      },
    ],
    excludeProducts: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
