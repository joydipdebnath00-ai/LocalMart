/**
 * Cryptographic helpers for Super Admin and authentication.
 * Uses Web Crypto API for secure client-side hashing without third-party bloat.
 */

export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateRandomSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateToken(prefix = 'tok_'): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return (
    prefix +
    Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function generateId(prefix = 'id_'): string {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function generateRazorpaySignature(orderId: string, paymentId: string): string {
  // Simulates HMAC-SHA256 razorpay signature verification
  const raw = `${orderId}|${paymentId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return 'rzp_sig_' + Math.abs(hash).toString(16).padStart(16, '0');
}

export function validateAdminPasswordRules(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  const forbidden = ['admin123', 'password', '123456', 'qwerty', 'admin'];
  if (forbidden.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Password is too common and insecure.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%...).' };
  }
  return { isValid: true };
}
