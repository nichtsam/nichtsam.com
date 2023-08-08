import { existsSync } from "fs";
import { stat, readdir, readFile } from "fs/promises";
import { resolve, relative } from "path";

export { readFile, readdir } from "fs/promises";
export { existsSync } from "fs";
export { resolve, dirname } from "path";

type File = {
  path: string;
  content: string | Buffer;
};

export const walk = async (
  path: string,
  rootPath: string = path,
): Promise<File[]> => {
  if (!existsSync(path)) {
    return [];
  }
  if ((await stat(path)).isFile()) {
    return [
      {
        path: relative(rootPath, path),
        content: await readFile(path),
      },
    ];
  } else {
    const dir = await readdir(path, { withFileTypes: true });
    const files = (
      await Promise.all(
        dir.map(async (dirent) => {
          const direntPath = resolve(path, dirent.name);
          return walk(direntPath, rootPath);
        }),
      )
    ).flat();

    return files;
  }
};
