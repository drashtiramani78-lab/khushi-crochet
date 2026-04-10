import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["super_admin", "moderator"],
      default: "moderator",
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_products",
          "manage_orders",
          "manage_reviews",
          "manage_coupons",
          "manage_custom_orders",
          "manage_admins",
          "view_analytics",
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "admins" }
);

// Hash password before saving
AdminSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function (passwordAttempt) {
  return await bcryptjs.compare(passwordAttempt, this.password);
};

// Method to check if account is locked
AdminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts
AdminSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lockUntil has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Increment attempts, lock if attempts exceed 5
  const updates = { $inc: { loginAttempts: 1 } };

  const maxAttempts = 5;
  const lockTimeWindow = 15 * 60 * 1000; // 15 minutes

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = {
      lockUntil: new Date(Date.now() + lockTimeWindow),
    };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
AdminSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

AdminSchema.index({ username: 1 });

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
