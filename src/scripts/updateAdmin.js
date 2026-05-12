import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

// Load env
dotenv.config({ path: './src/.env' });

const updateAdmin = async () => {
  try {
    await connectDB();

    const newEmail = 'admintest@clothing.com';
    const newPassword = 'admin@123';

    let admin = await User.findOne({ role: 'admin' });

    if (admin) {
      console.log(`Found existing admin: ${admin.email}`);
      admin.email = newEmail;
      admin.password = newPassword;
      await admin.save();
      console.log('Admin credentials updated successfully.');
    } else {
      console.log('No admin found. Creating new admin...');
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: newEmail,
        password: newPassword,
        role: 'admin',
      });
      console.log('Admin user created successfully.');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

updateAdmin();
