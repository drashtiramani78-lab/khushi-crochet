# Khushi Crochet - Complete File Structure

## USER SIDE (Customer-facing)

### User Pages (Frontend)
- `app/page.tsx` - Home page
- `app/products/page.jsx` - Products listing
- `app/products/[id]/page.jsx` - Product detail page
- `app/cart/page.jsx` - Shopping cart
- `app/checkout/page.jsx` - Checkout & payment
- `app/login/page.jsx` - User login
- `app/register/page.jsx` - User registration
- `app/profile/page.jsx` - User profile
- `app/account-settings/page.jsx` - Account settings
- `app/orders/page.jsx` - User's orders list
- `app/order-track/page.jsx` - Track order
- `app/contact/page.jsx` - Contact form
- `app/customorder/page.jsx` - Custom order request
- `app/wishlist/page.jsx` - Wishlist
- `app/confirmations/page.jsx` - Order confirmations

### User Components
- `app/components/navbar.jsx` - Navigation bar
- `app/components/hero.jsx` - Hero section
- `app/components/footer.jsx` - Footer
- `app/components/aboutsection.jsx` - About section
- `app/components/featuredproducts.jsx` - Featured products

### User Context & Hooks
- `app/context/AuthContext.jsx` - User authentication context
- `app/context/CartContext.jsx` - Shopping cart context
- `app/hooks/useAdminAuth.js` - Admin auth hook

### User Styles
- `app/styles/base.css`
- `app/styles/hero.css`
- `app/styles/navbar.css`
- `app/styles/footer.css`
- `app/styles/about.css`
- `app/styles/products.css`
- `app/styles/contact.css`
- `app/styles/orders.module.css`
- `app/styles/wishlist.module.css`
- `app/styles/profile.css`
- `app/styles/variables.css`
- `app/global.css`
- `app/global-new.css`

### User API Routes
- `app/api/auth/login/route.js` - User login endpoint
- `app/api/auth/register/route.js` - User registration endpoint
- `app/api/auth/logout/route.js` - User logout endpoint
- `app/api/auth/me/route.js` - Get current user info
- `app/api/auth/change-password/route.js` - Change password
- `app/api/auth/update-profile/route.js` - Update profile
- `app/api/products/route.js` - Get products list
- `app/api/products/[id]/route.js` - Get single product
- `app/api/orders/route.js` - Create & get orders
- `app/api/orders/[id]/route.js` - Get order details
- `app/api/orders/track/route.js` - Track order
- `app/api/orders/user/route.js` - Get user's orders
- `app/api/orders/generate-tracking/[id]/route.js` - Generate tracking ID
- `app/api/contact/route.js` - Submit contact form
- `app/api/contact/[id]/route.js` - Get contact message
- `app/api/reviews/route.js` - Get/create product reviews
- `app/api/coupons/route.js` - Apply coupons
- `app/api/custom-orders/route.js` - Create custom order
- `app/api/custom-orders/[id]/route.js` - Get custom order
- `app/api/custom-orders/user/route.js` - Get user's custom orders
- `app/api/custom-orders/generate-tracking/[id]/route.js` - Generate tracking ID
- `app/api/wishlist/route.js` - Manage wishlist
- `app/api/users/profile/route.js` - Get/update user profile
- `app/api/send-confirmation/route.js` - Send confirmation emails
- `app/api/payments/stripe/create-intent/route.js` - Stripe payment
- `app/api/payments/stripe/verify/route.js` - Stripe verification
- `app/api/payments/razorpay/create-order/route.js` - Razorpay payment
- `app/api/payments/razorpay/verify/route.js` - Razorpay verification

### User Database Models
- `models/user.js` - User schema
- `models/product.js` - Product schema
- `models/order.js` - Order schema
- `models/review.js` - Review schema
- `models/wishlist.js` - Wishlist schema
- `models/coupon.js` - Coupon schema
- `models/customorders.js` - Custom order schema
- `models/contact.js` - Contact form schema

---

## ADMIN SIDE (Admin-facing)

### Admin Pages (Frontend)
- `app/admin-login/page.jsx` - Admin login page
- `app/admin/page.jsx` - Admin dashboard home
- `app/admin/products/page.jsx` - Manage products
- `app/admin/categories/page.jsx` - Manage categories
- `app/admin/orders/page.jsx` - View all orders
- `app/admin/reviews/page.jsx` - Manage reviews
- `app/admin/users/page.jsx` - Manage users
- `app/admin/messages/page.jsx` - View contact messages
- `app/admin/custom/page.jsx` - Manage custom orders

### Admin Styles
- `app/admin-styles.css` - Admin dashboard styles
- `app/admin.css` - Admin page styles
- `app/admin-dashboard.css` - Dashboard specific styles
- `app/admin-layouts.css` - Layout styles
- `app/admin-products.css` - Products admin styles
- `app/admin-custom.css` - Custom orders admin styles

### Admin API Routes
- `app/api/admin-login/route.js` - Admin authentication
- `app/api/admin-logout/route.js` - Admin logout
- `app/api/admin/route.js` - Admin status check
- `app/api/admin/products/route.js` - Manage products
- `app/api/admin/products/[id]/route.js` - Edit/delete product
- `app/api/admin/categories/route.js` - Manage categories
- `app/api/admin/categories/[id]/route.js` - Edit/delete category
- `app/api/admin/orders/route.js` - View all orders
- `app/api/admin/reviews/route.js` - Manage reviews
- `app/api/admin/users/route.js` - Manage users
- `app/api/admin/users/create/route.js` - Create user
- `app/api/admin/coupons/route.js` - Manage coupons
- `app/api/admin/send-confirmation/route.js` - Send confirmations
- `app/api/auth/admin/route.js` - Check admin status

### Admin Database Models
- `models/admin.js` - Admin user schema
- `models/category.js` - Category schema

---

## SHARED LIBRARIES & UTILITIES

### Authentication & Security
- `lib/auth.js` - JWT authentication utilities
- `lib/sanitization.js` - XSS/injection prevention
- `lib/rateLimit.js` - Rate limiting for API routes
- `lib/rateLimitHelper.js` - Rate limit helper functions

### Database & Notifications
- `lib/mongodb.js` - MongoDB connection setup
- `lib/notifications.js` - Email & SMS notifications
- `lib/payments.js` - Payment processing utilities

---

## CONFIGURATION FILES

### Root Config
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `jsconfig.json` - JavaScript configuration
- `eslint.config.mjs` - ESLint rules
- `postcss.config.mjs` - PostCSS configuration
- `.env.local` - Environment variables
- `.env.example` - Example environment variables

### Layout & Global
- `app/layout.tsx` - Root layout
- `app/layout-wrapper.tsx` - Layout wrapper component

---

## SCRIPTS & DOCUMENTATION

- `scripts/seed-admin.js` - Seed admin user to database
- `scripts/test-rate-limit.js` - Test rate limiting
- `proxy.js` - Proxy configuration
- `README.md` - Project documentation
- `TESTING_GUIDE.js` - Testing guide
- `FIXES_COMPLETED_PHASE1.md` - Security fixes documentation
- `FILE_STRUCTURE.md` - This file

---

## PUBLIC ASSETS

- `public/upi-qr.png` - UPI QR code image

---

## SUMMARY

### User Side: ~30 pages/files
- 15 Frontend pages
- 27 API routes
- 8 Models
- 5+ Context/Hooks
- 13 CSS files
- 2 Component files

### Admin Side: ~9 pages/files
- 9 Frontend pages
- 14 API routes
- 2 Models
- 5 CSS files

### Shared Infrastructure
- 4 Authentication/Security utilities
- 3 Database/Notification utilities
- 8 Configuration files
- 3 Scripts & Documentation

**Total: 60+ Routes | 10 Database Models | 50+ Pages & Components**
