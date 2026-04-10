import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../lib/mongodb.js';
import Admin from '../models/admin.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
try {
  await connectDB();
} catch (dbError) {
  console.error('❌ Database connection failed:', dbError.message);
  console.log('\n💡 Fix:');
  console.log('1. Add MONGODB_URI to .env.local');
  console.log('   Example: MONGODB_URI=mongodb://localhost:27017/khushi-crochet');
  console.log('   Or Atlas: mongodb+srv://user:pass@cluster.mongodb.net/khushi-crochet');
  console.log('2. Ensure MongoDB is running');
  console.log('3. Restart terminal');
  process.exit(1);
}

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists. Skipping creation.');
      console.log(`Current admin: ${existingAdmin.username} (email: ${existingAdmin.email})`);
      rl.close();
      return;
    }

    // Prompt for password
    const password = await askQuestion('Enter admin password (default: admin123): ') || 'admin123';
    
    // Confirm password
    const confirmPassword = await askQuestion('Confirm password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match. Exiting.');
      rl.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const newAdmin = new Admin({
      username: 'admin',
      email: 'admin@khushicrochet.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: ['manage_users', 'manage_products', 'manage_orders', 'manage_reviews', 'manage_coupons', 'manage_custom_orders', 'manage_admins', 'view_analytics'],
      isActive: true
    });

    await newAdmin.save();
    console.log('✅ Admin user created successfully!');
    console.log(`👤 Username: admin`);
    console.log(`🔑 Password: ${password}`);
    console.log(`📧 Email: admin@khushicrochet.com`);
    console.log('\n💡 Login at: http://localhost:3000/admin-login');
    console.log('💡 Tip: Change password after first login via admin panel.\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    rl.close();
  }
}

main();

