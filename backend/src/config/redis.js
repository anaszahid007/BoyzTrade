import Redis from "ioredis";
import env from "./env.js";

const redis = new Redis(env.redis.url);

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

export default redis;
