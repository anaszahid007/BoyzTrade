import Redis from "ioredis";
import envs from "./envs.js";

const redis = new Redis(envs.redis.url);

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

export default redis;
