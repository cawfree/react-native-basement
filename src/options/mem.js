import { memcache } from "./memcache";

const defaultOptions = Object.freeze({
  limit: 32,
});

export const mem = (options = defaultOptions) => {
  const { limit } = { ...defaultOptions, ...options };
  const mem = {};
  const load = (token) => mem[token];
  const remove = (token) => delete mem[token];
  const save = (token, value) => (mem[token] = value);
  return memcache({ load, remove, save }, limit);
};
