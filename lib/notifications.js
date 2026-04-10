import nodemailer from "nodemailer";

// Conditionally import twilio dynamically only if credentials exist
let twilioClient = null;

const initTwilio = async () => {
  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    
    if (TWILIO_ACCOUNT_SID && TWILIO_ACCOUNT_SID.startsWith("AC") && TWILIO_AUTH_TOKEN) {
      const twilio = await import("twilio");
      twilioClient = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Twilio init failed:", error);
    twilioClient = null;
    return false;
  }
};

// Initialize on module load
initTwilio().catch(console.error);

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send confirmation email
export async function sendConfirmationEmail(user) {
  try {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Khushi Crochet! 🎉</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Thank you for registering with us. Your account has been successfully created.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555;">Account Details:</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone || "Not provided"}</p>
      </div>
      
      <p>You can now log in to your account and start shopping with us!</p>
      <p>
        <a href="${process.env.NEXTAUTH_URL}/login" 
           style="display: inline-block; padding: 12px 24px; background-color: #8b6f47; color: white; text-decoration: none; border-radius: 4px;">
          Go to Login
        </a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        If you did not register for this account, please ignore this email or contact our support team.
      </p>
      <p style="color: #999; font-size: 12px;">
        © 2024 Khushi Crochet. All rights reserved.
      </p>
    </div>
    `;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Welcome to Khushi Crochet - Registration Confirmation",
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

// Send SMS confirmation
export async function sendConfirmationSMS(phoneNumber, userName) {
  try {
    if (!twilioClient) {
      return { success: false, error: "Twilio not configured" };
    }

    await twilioClient.messages.create({
      body: `Welcome to Khushi Crochet, ${userName}! Your account has been created successfully. Log in to start shopping: ${process.env.NEXTAUTH_URL}/login`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return { success: true };
  } catch (error) {
    console.error("SMS send error:", error);
    return { success: false, error: error.message };
  }
}

// Send WhatsApp confirmation
export async function sendConfirmationWhatsApp(phoneNumber, userName) {
  try {
    if (!twilioClient) {
      return { success: false, error: "Twilio not configured" };
    }

    // Format phone number for WhatsApp (must include country code, e.g., +1234567890)
    const whatsappPhoneNumber = phoneNumber.startsWith("+")
      ? phoneNumber
      : "+91" + phoneNumber; // Default to India if no country code

    await twilioClient.messages.create({
      body: `👋 Welcome to Khushi Crochet, ${userName}!\n\nYour account has been created successfully. 🎉\n\nLog in now to start shopping:\n${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/login\n\n🧶 Happy Shopping!`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${whatsappPhoneNumber}`,
    });

    return { success: true };
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return { success: false, error: error.message };
  }
}

// Send all confirmations (email, SMS, WhatsApp)
export async function sendRegistrationConfirmation(user) {
  const emailResult = await sendConfirmationEmail(user);

  let smsResult = { success: true };
  let whatsappResult = { success: true };

  if (user.phone && process.env.TWILIO_ACCOUNT_SID) {
    smsResult = await sendConfirmationSMS(user.phone, user.name);
    whatsappResult = await sendConfirmationWhatsApp(user.phone, user.name);
  }

  return {
    emailSent: emailResult.success,
    smsSent: smsResult.success,
    whatsappSent: whatsappResult.success,
    errors: {
      email: emailResult.error,
      sms: smsResult.error,
      whatsapp: whatsappResult.error,
    },
  };
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(order, user) {
  try {
    const itemsList = order.items
      ?.map(
        (item) => `<li>${item.name} - ₹${item.price} x ${item.quantity}</li>`
      )
      .join("") || "<li>Order items</li>";

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmation 🎉</h2>
      <p>Hello <strong>${user.name}</strong>,</p>
      <p>Thank you for your order! We have received your order and will process it soon.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555;">Order Details:</h3>
        <p><strong>Order ID:</strong> ${order._id || order.trackingId}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status || "Processing"}</p>
        
        <h4 style="color: #666;">Items:</h4>
        <ul style="background-color: white; padding: 15px; border-radius: 4px;">
          ${itemsList}
        </ul>
        
        <h4 style="color: #666;">Totals:</h4>
        <p><strong>Subtotal:</strong> ₹${order.subtotal || order.totalAmount}</p>
        <p><strong>Shipping:</strong> ₹${order.shipping || 0}</p>
        <p><strong>Total:</strong> ₹${order.totalAmount || order.total}</p>
      </div>

      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #2e7d32;">Delivery Address:</h4>
        <p>${order.address}<br>
        ${order.city}, ${order.state} ${order.zipCode}</p>
      </div>
      
      <p>You can track your order using the tracking ID: <strong>${order.trackingId || order._id}</strong></p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/order-track" 
           style="display: inline-block; padding: 12px 24px; background-color: #8b6f47; color: white; text-decoration: none; border-radius: 4px;">
          Track Your Order
        </a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        If you have any questions, please contact our support team.
      </p>
      <p style="color: #999; font-size: 12px;">
        © 2024 Khushi Crochet. All rights reserved.
      </p>
    </div>
    `;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Order Confirmation - ${order.trackingId || order._id}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Order email send error:", error);
    return { success: false, error: error.message };
  }
}

// Send order confirmation SMS
export async function sendOrderConfirmationSMS(phoneNumber, userName, order) {
  try {
    if (!twilioClient) {
      return { success: false, error: "Twilio not configured" };
    }

    const trackingId = order.trackingId || order._id;
    const message = `Hi ${userName}! 📦 Your order ${trackingId} has been confirmed. Total: ₹${order.totalAmount}. Track here: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/order-track`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return { success: true };
  } catch (error) {
    console.error("Order SMS send error:", error);
    return { success: false, error: error.message };
  }
}

// Send order confirmation WhatsApp
export async function sendOrderConfirmationWhatsApp(phoneNumber, userName, order) {
  try {
    if (!twilioClient) {
      return { success: false, error: "Twilio not configured" };
    }

    const whatsappPhoneNumber = phoneNumber.startsWith("+")
      ? phoneNumber
      : "+91" + phoneNumber;

    const trackingId = order.trackingId || order._id;
    const message = `👋 Hi ${userName}!\n\n📦 Your order has been confirmed!\n\nOrder ID: ${trackingId}\nTotal: ₹${order.totalAmount}\nStatus: ${order.status || "Processing"}\n\n🔗 Track your order: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/order-track\n\n🧶 Thank you for shopping at Khushi Crochet!`;

    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${whatsappPhoneNumber}`,
    });

    return { success: true };
  } catch (error) {
    console.error("Order WhatsApp send error:", error);
    return { success: false, error: error.message };
  }
}

// Send custom order confirmation email
export async function sendCustomOrderConfirmationEmail(customOrder) {
  try {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Custom Order Received 🎨</h2>
      <p>Hello <strong>${customOrder.name}</strong>,</p>
      <p>Thank you for placing a custom order with Khushi Crochet! We have received your request and will review it shortly.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555;">Custom Order Details:</h3>
        <p><strong>Order ID:</strong> ${customOrder._id}</p>
        <p><strong>Product Type:</strong> ${customOrder.productType}</p>
        <p><strong>Color Theme:</strong> ${customOrder.colorTheme}</p>
        <p><strong>Budget:</strong> ₹${customOrder.budget}</p>
        <p><strong>Deadline:</strong> ${new Date(customOrder.deadline).toLocaleDateString()}</p>
        <p><strong>Status:</strong> Pending Review</p>
        
        ${customOrder.description ? `<p><strong>Description:</strong> ${customOrder.description}</p>` : ""}
      </div>
      
      <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #e65100;">What's Next?</h4>
        <p>Our team will review your custom order request and contact you within 24 hours with a detailed quote and timeline.</p>
      </div>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/profile" 
           style="display: inline-block; padding: 12px 24px; background-color: #8b6f47; color: white; text-decoration: none; border-radius: 4px;">
          View Order Status
        </a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        If you have any questions, please reply to this email or contact us.
      </p>
      <p style="color: #999; font-size: 12px;">
        © 2024 Khushi Crochet. All rights reserved.
      </p>
    </div>
    `;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: customOrder.email,
      subject: `Custom Order Received - Order ID: ${customOrder._id}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Custom order email send error:", error);
    return { success: false, error: error.message };
  }
}

// Send custom order confirmation SMS
export async function sendCustomOrderConfirmationSMS(
  phoneNumber,
  customerName,
  customOrder
) {
  try {
    if (!twilioClient) {
      return { success: false, error: "Twilio not configured" };
    }

    const message = `Hi ${customerName}! 🎨 Your custom order has been received. Order ID: ${customOrder._id}. We'll contact you within 24 hours. Budget: ₹${customOrder.budget}`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return { success: true };
  } catch (error) {
    console.error("Custom order SMS send error:", error);
    return { success: false, error: error.message };
  }
}

// Send custom order confirmation WhatsApp
export async function sendCustomOrderConfirmationWhatsApp(
  phoneNumber,
  customerName,
  customOrder
) {
  try {
    if (!twilioClient) {
      return { success: false, error: "Twilio not configured" };
    }

    const whatsappPhoneNumber = phoneNumber.startsWith("+")
      ? phoneNumber
      : "+91" + phoneNumber;

    const message = `👋 Hi ${customerName}!\n\n🎨 Your custom order has been received!\n\nOrder ID: ${customOrder._id}\nProduct: ${customOrder.productType}\nBudget: ₹${customOrder.budget}\nDeadline: ${new Date(customOrder.deadline).toLocaleDateString()}\n\n⏱️ Our team will contact you within 24 hours with a detailed quote.\n\n🧶 Thank you for choosing Khushi Crochet!`;

    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${whatsappPhoneNumber}`,
    });

    return { success: true };
  } catch (error) {
    console.error("Custom order WhatsApp send error:", error);
    return { success: false, error: error.message };
  }
}

// Send all order confirmations
export async function sendOrderConfirmation(order, user) {
  const emailResult = await sendOrderConfirmationEmail(order, user);

  let smsResult = { success: true };
  let whatsappResult = { success: true };

  if (user.phone && process.env.TWILIO_ACCOUNT_SID) {
    smsResult = await sendOrderConfirmationSMS(user.phone, user.name, order);
    whatsappResult = await sendOrderConfirmationWhatsApp(
      user.phone,
      user.name,
      order
    );
  }

  return {
    emailSent: emailResult.success,
    smsSent: smsResult.success,
    whatsappSent: whatsappResult.success,
    errors: {
      email: emailResult.error,
      sms: smsResult.error,
      whatsapp: whatsappResult.error,
    },
  };
}

// Send all custom order confirmations
export async function sendCustomOrderConfirmation(customOrder) {
  const emailResult = await sendCustomOrderConfirmationEmail(customOrder);

  let smsResult = { success: true };
  let whatsappResult = { success: true };

  if (customOrder.phone && process.env.TWILIO_ACCOUNT_SID) {
    smsResult = await sendCustomOrderConfirmationSMS(
      customOrder.phone,
      customOrder.name,
      customOrder
    );
    whatsappResult = await sendCustomOrderConfirmationWhatsApp(
      customOrder.phone,
      customOrder.name,
      customOrder
    );
  }

  return {
    emailSent: emailResult.success,
    smsSent: smsResult.success,
    whatsappSent: whatsappResult.success,
    errors: {
      email: emailResult.error,
      sms: smsResult.error,
      whatsapp: whatsappResult.error,
    },
  };
}
