#!/usr/bin/env node
/**
 * Quick database connection check.
 * Run from backend folder: node check-db.js  OR  npm run check-db
 */
import { testConnection } from './config/database.js';

async function main() {
  console.log('🔍 Checking database connection...\n');
  const ok = await testConnection();
  process.exit(ok ? 0 : 1);
}

main();
