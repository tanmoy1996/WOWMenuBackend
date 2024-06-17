import { redisClient } from "../../server";

export const getKey = async (request) => {
  let key = request.query;
  key.path = request.path;
  let hash = 0;

  let string = JSON.stringify(key);
  if (string.length === 0) return hash;
  for (let i = 0; i < string.length; i++) {
    let char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

export const isCached = async (id, key) => {
  return await redisClient.hExists(id, key);
};

export const getCachedData = async (id, key) => {
  const data = await redisClient.hGet(id, key);
  return JSON.parse(data);
};

export const storeDataInCache = async (id, key, data, isString = false) => {
  if (isString || data.length) {
    await redisClient.hSet(id, key, JSON.stringify(data));
    if (!isString) {
      await redisClient.expire(id, 3600);
    }
  }
};

export const burstCache = async (id) => {
  await redisClient.del(id);
};
