// Script to create 3 predefined admin users
// Run this once: node scripts/createAdminUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/krishivishwa';

// Predefined admin users
const predefinedAdmins = [
  {
    username: 'admin1',
    email: 'admin1@krishivishwa.com',
    password: 'Admin@123' // Must meet: uppercase, special char, digit, 8-20 chars
  },
  {
    username: 'admin2',
    email: 'admin2@krishivishwa.com',
    password: 'Admin@456'
  },
  {
    username: 'admin3',
    email: 'admin3@krishivishwa.com',
    password: 'Admin@789'
  }
];

async function createAdminUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const adminData of predefinedAdmins) {
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        console.log(`Admin ${adminData.email} already exists, skipping...`);
        continue;
      }

      // Create new admin (password will be hashed by pre-save hook)
      const admin = new Admin({
        username: adminData.username,
        email: adminData.email,
        password: adminData.password
      });

      await admin.save();
      console.log(`✓ Created admin: ${adminData.email}`);
    }

    console.log('\n✓ All admin users created successfully!');
    console.log('\nLogin credentials:');
    predefinedAdmins.forEach(admin => {
      console.log(`  Email: ${admin.email}, Password: ${admin.password}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdminUsers();
