import { createHmac, timingSafeEqual } from 'crypto';

// token: "<expiry in epoch milliseconds>.<base64url HMAC-SHA256 of that expiry under the secret>"
export const isTokenValid = (token: string, secret: string): boolean => {
  const [expiresAt, signature = ''] = token.split('.');
  const expected = createHmac('sha256', secret).update(expiresAt).digest();
  const given = Buffer.from(signature, 'base64url');
  return (
    given.length === expected.length &&
    timingSafeEqual(given, expected) &&
    Number(expiresAt) > Date.now()
  );
};
