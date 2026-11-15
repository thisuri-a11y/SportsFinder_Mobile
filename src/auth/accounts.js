import * as Crypto from 'expo-crypto';
import { bytesToHex } from '@noble/hashes/utils.js';
import { scryptAsync } from '@noble/hashes/scrypt.js';

const SALT_BYTES = 16;
const SCRYPT_OPTIONS = {
  N: 2 ** 14,
  r: 8,
  p: 1,
  dkLen: 32,
  maxmem: 64 * 1024 * 1024,
  asyncTick: 10,
};

const PUBLIC_ACCOUNT_COLUMNS = 'id, username, role, created_at';

class AccountFieldError extends Error {
  constructor(field, message) {
    super(message);
    this.field = field;
  }
}

function characterCount(value) {
  return Array.from(value).length;
}

function normalizeUsername(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AccountFieldError('username', 'Enter a username.');
  }

  const username = value.trim();
  const length = characterCount(username);
  if (length < 3 || length > 32 || username.includes('\0')) {
    throw new AccountFieldError('username', 'Use 3–32 characters.');
  }

  return username;
}

function validateNewPassword(value) {
  if (typeof value !== 'string' || characterCount(value) < 8) {
    throw new AccountFieldError('password', 'Use at least 8 characters.');
  }
  return value;
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function hashesMatch(first, second) {
  if (first.length !== second.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < first.length; index += 1) {
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }
  return difference === 0;
}

async function makePasswordHash(password) {
  const salt = await Crypto.getRandomBytesAsync(SALT_BYTES);
  const hash = await scryptAsync(password, salt, SCRYPT_OPTIONS);
  return {
    passwordHash: bytesToHex(hash),
    passwordSalt: bytesToHex(salt),
  };
}

function isUniqueConstraintError(error) {
  return /unique constraint failed|accounts_.*_idx/i.test(error?.message ?? '');
}

async function insertAccount(db, username, password, role) {
  const normalizedUsername = username.toLowerCase();
  const { passwordHash, passwordSalt } = await makePasswordHash(password);

  try {
    const result = await db.runAsync(
      `INSERT INTO accounts
        (username, username_key, password_hash, password_salt, role)
       VALUES (?, ?, ?, ?, ?)`,
      username,
      normalizedUsername,
      passwordHash,
      passwordSalt,
      role,
    );
    return getAccountById(db, result.lastInsertRowId);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AccountFieldError('username', 'That username is already in use.');
    }
    throw error;
  }
}

export async function registerAccount(db, credentials, role) {
  if (role !== 'buyer' && role !== 'shop_owner') {
    throw new Error('Choose a buyer or shop owner account.');
  }
  const username = normalizeUsername(credentials?.username);
  const password = validateNewPassword(credentials?.password);
  return insertAccount(db, username, password, role);
}

export async function authenticateAccount(db, credentials) {
  const username = normalizeUsername(credentials?.username);
  const password = credentials?.password;

  if (typeof password !== 'string' || password.length === 0) {
    throw new AccountFieldError('password', 'Enter your password.');
  }

  const account = await db.getFirstAsync(
    `SELECT ${PUBLIC_ACCOUNT_COLUMNS}, password_hash, password_salt
     FROM accounts
     WHERE username = ? COLLATE NOCASE
        OR username_key = ? COLLATE NOCASE
     LIMIT 1`,
    username,
    username.toLowerCase(),
  );

  if (!account) {
    throw new Error('Username or password is incorrect.');
  }

  const candidateHash = bytesToHex(
    await scryptAsync(password, hexToBytes(account.password_salt), SCRYPT_OPTIONS),
  );
  if (!hashesMatch(candidateHash, account.password_hash)) {
    throw new Error('Username or password is incorrect.');
  }

  return {
    id: account.id,
    username: account.username,
    role: account.role,
    created_at: account.created_at,
  };
}

export function getAccountById(db, accountId) {
  return db.getFirstAsync(
    `SELECT ${PUBLIC_ACCOUNT_COLUMNS} FROM accounts WHERE id = ?`,
    accountId,
  );
}

export async function updateAccountPassword(db, account, { currentPassword, newPassword }) {
  const nextPassword = validateNewPassword(newPassword);
  if (!currentPassword) {
    throw new AccountFieldError('currentPassword', 'Enter your current password.');
  }

  const stored = await db.getFirstAsync(
    `SELECT a.password_hash, a.password_salt
     FROM accounts a JOIN local_session s ON s.account_id = a.id
     WHERE a.id = ? AND s.singleton_id = 1`,
    account.id,
  );
  if (!stored) throw new Error('Sign in again to change your password.');

  const candidate = bytesToHex(await scryptAsync(currentPassword, hexToBytes(stored.password_salt), SCRYPT_OPTIONS));
  if (!hashesMatch(candidate, stored.password_hash)) {
    throw new AccountFieldError('currentPassword', 'Current password is incorrect.');
  }

  const { passwordHash, passwordSalt } = await makePasswordHash(nextPassword);
  const { changes } = await db.runAsync(
    `UPDATE accounts SET password_hash = ?, password_salt = ?
     WHERE id = ? AND password_hash = ? AND password_salt = ?
       AND EXISTS (SELECT 1 FROM local_session WHERE singleton_id = 1 AND account_id = accounts.id)`,
    passwordHash, passwordSalt, account.id, stored.password_hash, stored.password_salt,
  );
  if (changes !== 1) throw new Error('The account changed. Sign in again and retry.');
}
