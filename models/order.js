import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Product name required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price required'],
    min: [0, 'Price cannot be negative'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity required'],
    min: [1, 'Quantity must be at least 1'],
  },
  image: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name required'],
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone required'],
      validate: {
        validator: function(v) {
          return /^[0-9]{10}$/.test(v.replace(/\D/g, ''));
        },
        message: 'Phone must be 10 digits',
      },
    },
    address: {
      type: String,
      required: [true, 'Address required'],
      trim: true,
    },
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India',
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cannot be negative'],
    },
    // ========== NEW FIELDS FOR COUPON SUPPORT ==========
    couponCode: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    // ===================================================
    totalAmount: {
      type: Number,
      required: [true, 'Total amount required'],
      min: [0, 'Total cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY', 'STRIPE', 'UPI_QR'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Pending_Verification'],
      default: 'Pending',
    },
    razorpayPaymentId: String,
    transactionId: String,
    upiId: String,
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      default: 'Pending',
    },
    trackingId: {
      type: String,
      unique: true,
      required: true,
    },
    notes: String,
    shippingPartner: String,
    trackingUrl: String,
  },
  { timestamps: true }
);

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ trackingId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'items.productId': 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);

