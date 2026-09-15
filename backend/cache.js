const nodeCache = require("node-cache");
const cache = new nodeCache({ stdTTL: 3600, checkperiod: 120 }); // stdTTL artinya waktu hidup default untuk setiap item dalam cache (dalam detik), dan checkperiod adalah interval waktu untuk memeriksa item yang sudah kedaluwarsa.

const getOrSet = (key, fetchFn, ttl = 3600) => {
  return new Promise((resolve, reject) => {
    const cachedValue = cache.get(key);
    if (cachedValue) {
      console.log(`✅ Cache HIT: ${key}`);
      resolve(cachedValue);
    }
    console.log(`⏳ Cache MISS: ${key}`);
    fetchFn()
      .then((result) => {
        cache.set(key, result, ttl);
        resolve(result);
      })
      .catch(reject);
  });
};

const invalidate = (keyPattern) => {
  const keys = cache.keys();
  const toDelete = keys.filter((key) => key.includes(keyPattern));
  toDelete.forEach((key) => cache.del(key));
};

const clearCache = () => {
  cache.flushAll();
  console.log("🗑️ All cache cleared");
};

module.exports = { getOrSet, invalidate, clearCache, cache };
