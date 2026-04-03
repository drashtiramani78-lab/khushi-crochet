import mongoose from "mongoose";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      validate: [
        {
          validator: (v) => emailRegex.test(v),
          message: "Invalid email format",
        },
      ],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      validate: [
        {
          validator: (v) => v === "" || phoneRegex.test(v),
          message: "Invalid phone number format",
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
      required: [true, "Message is required"],
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Contact ||
  mongoose.model("Contact", ContactSchema);