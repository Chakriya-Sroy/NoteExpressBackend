// getOrSetCache.js
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  username: process.env.REDIS_USER || "default", // ✅ Fixed typo
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_SOCKET_HOST,
    port: parseInt(process.env.REDIS_SOCKET_PORT) || 6379, // ✅ Parse to integer
    connectTimeout: 10000,
  },
});

client.on("error", (err) => console.log("REDIS Client Error", err));
client.on("connect", () => console.log("✅ REDIS Client Connected to Cloud"));
client.on("ready", () => console.log("✅ REDIS Client Ready"));

try {
  await client.connect();
  console.log("✅ Successfully connected to REDIS Cloud");

  // Test connection
  const pong = await client.ping();
  console.log("REDIS ping:", pong);
} catch (err) {
  console.error("❌ Failed to connect to REDIS Cloud:", err.message);
  console.error("Check your .env file has:");
  console.error("- REDIS_USER");
  console.error("- REDIS_PASSWORD");
  console.error("- REDIS_SOCKET_HOST");
  console.error("- REDIS_SOCKET_PORT");
  process.exit(1);
}

const EXPIRATION_DEFAULT = 1000 * 60 * 5; 

const getOrSetCache = async (key, cb) => {
  try {
    const data = await client.get(key);

    if (data != null) {
      console.log("✅ Cache hit:", key);
      return JSON.parse(data);
    }

    console.log("⚠️ Cache miss:", key);
    const freshData = await cb();
    await client.setEx(key, EXPIRATION_DEFAULT, JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    throw error;
  }
};

// Clear specific cache key - check if exists first
const clearCache = async (key) => {
  try {
    const exists = await client.exists(key);
    if (exists) {
      await client.del(key);
      console.log(`Cache cleared: ${key}`);
      return true;
    } else {
      console.log(`Cache key not found: ${key}`);
      return false;
    }
  } catch (error) {
    console.log("Error clearing cache:", error);
    return false;
  }
};

// Clear multiple cache keys - check if pattern matches any keys
const clearCachePattern = async (pattern) => {
  try {
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await client.del(keys);
      console.log(
        `Cleared ${keys.length} cache keys matching pattern: ${pattern}`
      );
      return keys.length;
    } else {
      console.log(`No cache keys found matching pattern: ${pattern}`);
      return 0;
    }
  } catch (error) {
    console.log("Error clearing cache pattern:", error);
    return 0;
  }
};

// Update cache directly - check if exists first
const updateCache = async (key, data) => {
  try {
    const exists = await client.exists(key);

    if (exists) {
      await client.setEx(key, EXPIRATION_DEFAULT, JSON.stringify(data));
      console.log(`Cache updated: ${key}`);
      return true;
    } else {
      console.log(`Cache key not found, creating new: ${key}`);
      await client.setEx(key, EXPIRATION_DEFAULT, JSON.stringify(data));
      return true;
    }
  } catch (error) {
    console.log("Error updating cache:", error);
    return false;
  }
};

// Optional: Check if cache exists
const cacheExists = async (key) => {
  try {
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.log("Error checking cache:", error);
    return false;
  }
};

export {
  getOrSetCache,
  clearCache,
  clearCachePattern,
  updateCache,
  cacheExists,
};
