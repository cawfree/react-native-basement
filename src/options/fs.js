import {
  DocumentDirectoryPath,
  exists,
  readFile,
  writeFile,
  unlink,
  mkdir,
} from "react-native-fs";

import { memcache } from "./memcache";

const defaultOptions = Object.freeze({
  baseDir: `${DocumentDirectoryPath}/basement`,
  limit: 32,
});

export const json = (options = defaultOptions) => {
  const { baseDir, limit } = { ...defaultOptions, ...options };

  const assertDir = () =>
    exists(baseDir).then((doesExist) => !doesExist && mkdir(baseDir));

  const remove = async (token) => {
    await assertDir();
    await unlink(`${baseDir}/${token}`);
  };

  const load = async (token) => {
    await assertDir();
    const path = `${baseDir}/${token}`;
    const doesExist = await exists(path);
    if (doesExist) {
      const raw = await readFile(path);
      return JSON.parse(raw);
    }
    return null;
  };

  const save = async (token, value) => {
    await assertDir();
    return writeFile(`${baseDir}/${token}`, JSON.stringify(value));
  };

  /* optimize in-memory allocations */
  return memcache({ load, remove, save }, limit);
};
