const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const { connectDB, disconnectDB } = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@workzo.com';
    const adminPassword = 'Admin@12345';
    const adminName = 'Workzo Admin';

    console.log(`[seedAdmin] Checking for admin user: ${adminEmail}...`);

    let admin = await User.findOne({ email: adminEmail }).select('+password');

    if (admin) {
      console.log(`[seedAdmin] Admin account already exists (ID: ${admin._id}). Verifying role and updating password...`);
      admin.name = adminName;
      admin.role = 'admin';
      admin.password = adminPassword; // Triggers pre('save') bcrypt hash
      admin.isActive = true;
      await admin.save();
      console.log(`[seedAdmin] Existing admin account successfully verified & updated to role 'admin'.`);
    } else {
      console.log(`[seedAdmin] Admin user not found. Creating default development admin account...`);
      admin = new User({
        name: adminName,
        email: adminEmail,
        phone: '+91 98765 00000',
        password: adminPassword, // Triggers pre('save') bcrypt hash
        role: 'admin',
        address: 'Workzo Tech Park, Level 4',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        isActive: true,
      });

      await admin.save();
      console.log(`[seedAdmin] Admin account created successfully (ID: ${admin._id}) with role 'admin'.`);
    }

    return admin;
  } catch (error) {
    console.error('[seedAdmin Error]:', error);
    throw error;
  }
};

// Standalone execution
if (require.main === module) {
  connectDB()
    .then(seedAdmin)
    .then(async () => {
      console.log('[seedAdmin] Done.');
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[seedAdmin Fatal Error]:', err);
      await disconnectDB();
      process.exit(1);
    });
}

module.exports = { seedAdmin };
