#!/usr/bin/env node
/**
 * MarketPulse Platform - Super Admin Creation CLI
 * Usage: node scripts/createsuperadmin.js
 *
 * Securely provisions the primary SUPER_ADMIN account with strong password hashing (PBKDF2/SHA-256).
 * Never hard-codes credentials.
 */

import readline from 'readline';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

const FORBIDDEN_PASSWORDS = [
  'admin', 'admin123', 'password', '123456', '12345678', 'qwerty',
  'superadmin', 'root', 'welcome', 'letmein'
];

function validatePassword(pwd) {
  if (pwd.length < 8) return 'Password must be at least 8 characters long.';
  if (FORBIDDEN_PASSWORDS.includes(pwd.toLowerCase())) return 'Password is too common and weak.';
  if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
  if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain at least one special character.';
  return null;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

async function main() {
  console.log('\n==================================================');
  console.log(' MARKETPULSE PLATFORM - SUPER ADMIN INITIAL SETUP');
  console.log('==================================================\n');
  console.log('This utility configures the initial root SUPER_ADMIN account.');
  console.log('Credentials will be salted and hashed (PBKDF2-SHA512 100,000 iterations).\n');

  const email = (await question('Super Admin Email: ')).trim();
  if (!email || !email.includes('@')) {
    console.error('❌ Error: A valid email address is required.');
    rl.close();
    process.exit(1);
  }

  const name = (await question('Full Name: ')).trim();
  if (!name) {
    console.error('❌ Error: Name is required.');
    rl.close();
    process.exit(1);
  }

  const password = await question('Super Admin Password (min 8 chars, mixed case, number, symbol): ');
  const error = validatePassword(password);
  if (error) {
    console.error(`❌ Security Policy Error: ${error}`);
    rl.close();
    process.exit(1);
  }

  const confirm = await question('Confirm Password: ');
  if (password !== confirm) {
    console.error('❌ Error: Passwords do not match.');
    rl.close();
    process.exit(1);
  }

  const { salt, hash } = hashPassword(password);
  const adminId = 'sa_' + crypto.randomBytes(8).toString('hex');
  const adminProfile = {
    id: adminId,
    email: email.toLowerCase(),
    name,
    role: 'SUPER_ADMIN',
    salt,
    passwordHash: hash,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    isPrimaryOwner: true,
  };

  const configDir = path.resolve(process.cwd(), 'src/config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const adminConfigFile = path.join(configDir, 'superadmin.json');
  fs.writeFileSync(adminConfigFile, JSON.stringify(adminProfile, null, 2), 'utf-8');

  console.log('\n✅ Super Admin account successfully created!');
  console.log(`   ID:    ${adminId}`);
  console.log(`   Email: ${email}`);
  console.log(`   Name:  ${name}`);
  console.log(`   Role:  SUPER_ADMIN`);
  console.log('\n🔒 The secure hash has been saved to src/config/superadmin.json');
  console.log('You can now log in via the Super Admin Login screen.\n');

  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
