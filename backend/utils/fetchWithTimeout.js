export const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const cacheStore = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export const memoize = (fn, keyFn = (...args) => JSON.stringify(args)) => {
  return async (...args) => {
    const key = keyFn(...args);
    const cached = cacheStore.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    const data = await fn(...args);
    cacheStore.set(key, { data, timestamp: Date.now() });
    return data;
  };
};
