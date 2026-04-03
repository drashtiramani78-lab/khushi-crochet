import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [
        {
          validator: (v) => emailRegex.test(v),
          message: "Invalid email format",
        },
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
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
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either 'user' or 'admin'",
      },
      default: "user",
    },
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
    smsConfirmed: {
      type: Boolean,
      default: false,
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    confirmationSmsSent: {
      type: Boolean,
      default: false,
    },
    confirmationWhatsappSent: {
      type: Boolean,
      default: false,
    },
    whatsappConfirmed: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    zipCode: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);