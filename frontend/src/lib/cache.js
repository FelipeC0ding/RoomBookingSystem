import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_REST_URL,
  token: import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN,
});

console.log("Upstash URL:", import.meta.env.VITE_UPSTASH_REDIS_REST_URL);
console.log("Upstash Token:", import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN ? "Token Exists!" : "Missing!");

export async function cacheGet(key) {
  try {
    const val = await redis.get(key);
    return val !== null ? val : null;
  } catch (error) {
    console.error(`Cache get error: ${error.message}`);
    return null; // cache miss - app continues without cache
  }
}

export async function cacheSet(key, value, timeout = 120) {
  try {
    await redis.set(key, value, { ex: timeout });
  } catch (error) {
    console.error(`Cache set error: ${error.message}`);
  }
}

export async function cacheDelete(key) {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Cache delete error: ${error.message}`);
  }
}
