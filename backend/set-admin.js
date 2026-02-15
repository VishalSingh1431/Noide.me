#!/usr/bin/env node
/**
 * Set a user as main_admin by email.
 * Usage: node set-admin.js
 */
import { initializeDatabase } from './config/database.js';
import User from './models/User.js';

const ADMIN_EMAIL = 'vishalsingh05072003@gmail.com';

async function main() {
  console.log('Setting admin:', ADMIN_EMAIL, '\n');
  try {
    await initializeDatabase();
    const user = await User.findByEmail(ADMIN_EMAIL);
    if (!user) {
      console.log('User not found. Sign up first with', ADMIN_EMAIL);
      process.exit(1);
    }
    await User.update(user.id, { role: 'main_admin' });
    console.log('Done. User is now main_admin:', user.email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
