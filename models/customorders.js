import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;

const customOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: {
      type: String,
      default: "",
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      trim: true,
    },
    email: {
      type: String,
      default: "",
      validate: [
        {
          validator: (v) => v === "" || emailRegex.test(v),
          message: "Invalid email format",
        },
      ],
    },
    phone: {
      type: String,
      default: "",
      validate: [
        {
          validator: (v) => v === "" || phoneRegex.test(v),
          message: "Invalid phone number format",
        },
      ],
    },
    productType: {
      type: String,
      default: "",
      maxlength: [100, "Product type cannot exceed 100 characters"],
      trim: true,
    },
    colorTheme: {
      type: String,
      default: "",
      maxlength: [100, "Color theme cannot exceed 100 characters"],
      trim: true,
    },
    budget: {
      type: String,
      default: "",
      maxlength: [50, "Budget cannot exceed 50 characters"],
    },
    deadline: {
      type: String,
      default: "",
      validate: [
        {
          validator: (v) => v === "" || !isNaN(Date.parse(v)),
          message: "Deadline must be a valid date",
        },
      ],
    },
    subject: {
      type: String,
      default: "",
      maxlength: [200, "Subject cannot exceed 200 characters"],
      trim: true,
    },
    message: {
      type: String,
      default: "",
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      trim: true,
    },
    referenceImage: {
      type: String,
      default: "",
      validate: [
        {
          validator: (v) => v === "" || /^(https?:\/\/.+|\/images\/.+)$/.test(v),
          message: "Reference image must be a valid URL or path",
        },
      ],
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "In Progress", "Completed", "Cancelled"],
        message: "Invalid status value",
      },
      default: "Pending",
    },
    trackingId: {
      type: String,
      unique: true,
      required: [true, "Tracking ID is required"],
      default: () => `CUSTOM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      index: true,
    },
    
    confirmationEmailSent: { type: Boolean, default: false },
    confirmationSMSSent: { type: Boolean, default: false },
    confirmationWhatsAppSent: { type: Boolean, default: false },
    
    estimatedPrice: {
      type: Number,
      default: 0,
      min: [0, "Estimated price cannot be negative"],
    },
    finalPrice: {
      type: Number,
      default: 0,
      min: [0, "Final price cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["Pending", "Completed", "Cancelled"],
        message: "Invalid payment status",
      },
      default: "Pending",
    },
    notes: {
      type: String,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

const CustomOrder =
  mongoose.models.CustomOrder ||
  mongoose.model("CustomOrder", customOrderSchema);

export default CustomOrder;