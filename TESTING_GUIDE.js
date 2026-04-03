/**
 * ADMIN USER CONFIRMATION SYSTEM - TESTING GUIDE
 * 
 * This file contains code snippets and examples for testing 
 * the email, SMS, and WhatsApp confirmation system.
 */

// ==================== SETUP ====================

/**
 * 1. Install required dependencies (already done):
 *    - nodemailer: npm install nodemailer
 *    - twilio: npm install twilio
 */

// ==================== ENVIRONMENT VARIABLES ====================

/**
 * 2. Add to your .env.local file:
 */

// Email (Gmail example)
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_SECURE=false
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-app-specific-password
// EMAIL_FROM=noreply@khushicrochet.com

// Twilio
// TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
// TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
// TWILIO_PHONE_NUMBER=+1234567890
// TWILIO_WHATSAPP_NUMBER=+1234567890

// App
// NEXT_PUBLIC_APP_URL=http://localhost:3000
// NEXTAUTH_URL=http://localhost:3000

// ==================== ADMIN USERS PAGE ====================

/**
 * 3. Access Admin Users Page:
 *    - URL: http://localhost:3000/admin/users
 *    - Make sure you're logged in as admin
 *    - You'll see:
 *      a) List of all registered users
 *      b) Filter by role (Admin/User)
 *      c) User statistics
 *      d) Action buttons to send confirmations
 */

// ==================== SEND CONFIRMATIONS ====================

/**
 * 4. To send confirmations via the UI:
 *    - Click "View & Send" on any user
 *    - Modal opens with user details
 *    - Click buttons to send:
 *      a) "📧 Send Email Confirmation" - Send welcome email
 *      b) "📱 Send SMS Confirmation" - Send SMS (if phone available)
 *      c) "💬 Send WhatsApp Confirmation" - Send WhatsApp (if phone available)
 *      d) "🚀 Send All Confirmations" - Send email + SMS + WhatsApp
 */

// ==================== API EXAMPLES ====================

/**
 * 5. Direct API call examples (using fetch or axios):
 */

// Example 1: Send email confirmation
async function sendEmailConfirmation(userId) {
  try {
    const response = await fetch("/api/admin/send-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        type: "email",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Email sent successfully!", data);
      return data;
    } else {
      console.error("❌ Failed to send email:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return null;
  }
}

// Example 2: Send SMS confirmation
async function sendSMSConfirmation(userId) {
  try {
    const response = await fetch("/api/admin/send-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        type: "sms",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SMS sent successfully!", data);
      return data;
    } else {
      console.error("❌ Failed to send SMS:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
    return null;
  }
}

// Example 3: Send WhatsApp confirmation
async function sendWhatsAppConfirmation(userId) {
  try {
    const response = await fetch("/api/admin/send-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        type: "whatsapp",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ WhatsApp sent successfully!", data);
      return data;
    } else {
      console.error("❌ Failed to send WhatsApp:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error sending WhatsApp:", error);
    return null;
  }
}

// Example 4: Send all confirmations at once
async function sendAllConfirmations(userId) {
  try {
    const response = await fetch("/api/admin/send-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        type: "all",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ All confirmations sent successfully!", {
        email: data.emailSent,
        sms: data.smsSent,
        whatsapp: data.whatsappSent,
      });
      return data;
    } else {
      console.error("❌ Failed to send confirmations:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error sending confirmations:", error);
    return null;
  }
}

// ==================== BULK TESTING ====================

/**
 * 6. Test sending to multiple users:
 */

async function sendConfirmationsToAllUsers(type = "email") {
  try {
    // Fetch all users
    const usersResponse = await fetch("/api/admin/users");
    const users = await usersResponse.json();

    console.log(`🚀 Sending ${type} confirmations to ${users.length} users...`);

    let successCount = 0;
    let failedCount = 0;

    for (const user of users) {
      try {
        const response = await fetch("/api/admin/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            type: type,
          }),
        });

        if (response.ok) {
          successCount++;
          console.log(`✅ Sent to ${user.email}`);
        } else {
          failedCount++;
          console.log(`❌ Failed for ${user.email}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ Error for ${user.email}:`, error);
      }

      // Add 1 second delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `\n📊 Results: ${successCount} successful, ${failedCount} failed`
    );
    return { successCount, failedCount };
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return null;
  }
}

// ==================== TROUBLESHOOTING ====================

/**
 * 7. Common Issues and Solutions:
 *
 * ISSUE: Email not sending
 * SOLUTIONS:
 *   - Verify EMAIL_USER and EMAIL_PASS are correct
 *   - For Gmail: Use App Password, not regular password
 *   - Check EMAIL_HOST is "smtp.gmail.com"
 *   - Ensure EMAIL_PORT is 587 and EMAIL_SECURE is false
 *
 * ISSUE: SMS/WhatsApp not sending
 * SOLUTIONS:
 *   - Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
 *   - Ensure phone numbers include country code (+91, +1, etc.)
 *   - Check Twilio account has enough credits
 *   - Test phone number in Twilio console first
 *
 * ISSUE: Admin can't send confirmations
 * SOLUTIONS:
 *   - Ensure admin_auth cookie is set to "true"
 *   - Check browser developer tools -> Network tab
 *   - Verify userId exists in database
 *   - Check server logs for errors
 *
 * ISSUE: "Unauthorized" error
 * SOLUTIONS:
 *   - User must be logged in as admin
 *   - Admin must have "role: admin" in database
 *   - Clear browser cache and login again
 */

// ==================== MONITORING ====================

/**
 * 8. Monitor Confirmations:
 *
 * Check Gmail sent folder:
 *   - Look for emails from EMAIL_FROM address
 *   - Verify subject: "Welcome to Khushi Crochet - Registration Confirmation"
 *
 * Check Twilio logs:
 *   - Twilio Console > Logs > Messages
 *   - See SMS and WhatsApp delivery status
 *
 * Database logs:
 *   - Add console logs in API routes to track requests
 *   - Monitor database for new user entries
 */

// ==================== PRODUCTION CHECKLIST ====================

/**
 * 9. Before going to production:
 *
 * ✅ Email Configuration
 *    [ ] Use production email service (not Gmail)
 *    [ ] Set up proper DKIM, SPF, DMARC records
 *    [ ] Test email delivery
 *
 * ✅ SMS/WhatsApp Configuration
 *    [ ] Twilio account has sufficient credits
 *    [ ] Phone numbers are verified
 *    [ ] Test with real phone numbers
 *
 * ✅ Environment Variables
 *    [ ] All variables are in .env.local
 *    [ ] Variables are NOT in version control
 *    [ ] Use production API keys/tokens
 *
 * ✅ Security
 *    [ ] Admin authentication is secure
 *    [ ] Rate limiting is implemented
 *    [ ] Phone number validation is in place
 *    [ ] Error messages don't leak sensitive info
 *
 * ✅ Database
 *    [ ] User model has phone field
 *    [ ] Phone field is validated
 *    [ ] Phone numbers are stored securely
 *
 * ✅ Testing
 *    [ ] Send confirmations to test email
 *    [ ] Send confirmations to test phone
 *    [ ] Test error handling
 *    [ ] Test with missing phone numbers
 */

// ==================== EXAMPLE RESPONSE ====================

/**
 * 10. Expected API Response:
 */

const exampleResponse = {
  success: true,
  emailSent: true,
  smsSent: true,
  whatsappSent: true,
  errors: {
    email: null,
    sms: null,
    whatsapp: null,
  },
};

// If any fails:
const exampleErrorResponse = {
  success: false,
  emailSent: true,
  smsSent: false,
  whatsappSent: true,
  errors: {
    email: null,
    sms: "User has no phone number",
    whatsapp: null,
  },
};
