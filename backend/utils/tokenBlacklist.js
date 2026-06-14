const blacklist = new Map();
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of blacklist.entries()) {
    if (now > expiresAt) {
      blacklist.delete(token);
    }
  }
}, 60 * 60 * 1000);

export const addToBlacklist = (token, ttlMs = DEFAULT_TTL) => {
  blacklist.set(token, Date.now() + ttlMs);
};

export const isBlacklisted = (token) => {
  const expiresAt = blacklist.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    blacklist.delete(token);
    return false;
  }
  return true;
};

export const removeFromBlacklist = (token) => {
  blacklist.delete(token);
};