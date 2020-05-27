import { typeCheck } from "type-check";
import LRUMap from "mnemonist/lru-map";

const promisify = (fn) => Promise.resolve().then(fn);

export const memcache = (opts, size) => {
  if (!typeCheck("{load:Function,...}", opts)) {
    throw new Error(`Expected Function load, encountered ${opts.load}.`);
  } else if (!typeCheck("{save:Function,...}", opts)) {
    throw new Error(`Expected Function save, encountered ${opts.save}.`);
  } else if (!typeCheck("{remove:Function,...}", opts)) {
    throw new Error(`Expected Function remove, encountered ${opts.remove}.`);
  }

  const cache = new LRUMap(size);

  const { load, remove, save } = opts;

  const insert = (token, data) =>
    promisify(() => {
      /* register the image */
      const { evicted, key: removeToken } = cache.setpop(token, data) || {};
      if (evicted) {
        /* delete the underlying resource */
        return promisify(() => remove(removeToken));
      }
    });

  return Object.freeze({
    load: async (token) => {
      /* if in memory, return quickly */
      if (cache.has(token)) {
        return cache.get(token);
      }
      const result = await promisify(() => load(token));
      if (result) {
        await insert(token, result);
      }
      return result;
    },
    save: async (token, value) => {
      await promisify(() => save(token, value));
      await insert(token, value);
    },
  });
};
