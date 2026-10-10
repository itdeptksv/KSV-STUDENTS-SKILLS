require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function setupAdmin() {
  const setupToken = process.argv[2];
  const name = process.argv[3];
  const email = process.argv[4];
  const password = process.argv[5];

  if (!setupToken || !name || !email || !password) {
    console.error('Usage: node scripts/setupAdmin.js <ADMIN_SETUP_TOKEN> <name> <email> <password>');
    process.exit(1);
  }
  if (setupToken !== process.env.ADMIN_SETUP_TOKEN) {
    console.error('Invalid setup token');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }
  const admin = await User.create({ name, email, password, role: 'admin' });
  console.log('Admin created:', admin.email);
  await mongoose.disconnect();
}

setupAdmin().catch((err) => { console.error(err); process.exit(1); });
