#!/usr/bin/env node
/**
 * Admin User Seed Script
 * 
 * Usage:
 *   node scripts/seed-admin.js
 * or
 *   ADMIN_USERNAME=admin ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123! node scripts/seed-admin.js
 */

import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Import Admin model
import Admin from "../models/admin.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set");
  process.exit(1);
}

async function seedAdmin() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Default credentials (should be changed in production)
    const defaultUsername = process.env.ADMIN_USERNAME || "admin";
    const defaultEmail = process.env.ADMIN_EMAIL || "admin@khushi-crochet.com";
    const defaultPassword =
      process.env.ADMIN_PASSWORD || "SecureAdmin123!@#";

    // Validate password strength
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(defaultPassword)) {
      console.error(
        "❌ Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
      process.exit(1);
    }

    console.log("\n📋 Admin Credentials:");
    console.log(`   Username: ${defaultUsername}`);
    console.log(`   Email: ${defaultEmail}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(
      "\n⚠️  IMPORTANT: Change these credentials immediately after first login!\n"
    );

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: defaultUsername });

    if (existingAdmin) {
      console.log(`⚠️  Admin user "${defaultUsername}" already exists`);

      // Ask if user wants to update password
      console.log("Do you want to update the password? (y/n)");
      console.log("(This script will exit - you can run it again if needed)\n");

      // For now, just exit
      console.log("✅ Seed script complete. Admin user already exists.");
      process.exit(0);
    }

    // Create admin user
    console.log("📝 Creating admin user...");

    const adminUser = new Admin({
      username: defaultUsername,
      email: defaultEmail,
      password: defaultPassword,
      role: "super_admin",
      permissions: [
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_reviews",
        "manage_coupons",
        "manage_custom_orders",
        "manage_admins",
        "view_analytics",
      ],
      isActive: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!\n");

    console.log("🎉 Seed completed!");
    console.log("\nYou can now log in with:");
    console.log(`   Username: ${defaultUsername}`);
    console.log(`   Password: ${defaultPassword}\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run seed
seedAdmin();
