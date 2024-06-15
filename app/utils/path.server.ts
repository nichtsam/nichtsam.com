import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { env } from "process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // prod: build/server/assets/server-build-[hash].js | dev: app/utils/path.server.ts
const __dirname = dirname(__filename); // prod: build/server/assets | dev: app/utils
export const rootPath = resolve(
  __dirname,
  env.NODE_ENV === "production" ? "../../../" : "../../",
);

export function getFilePathInDirectoryByName(
  dirPath: string,
  name: string,
  extensions: string[],
) {
  for (let ext of extensions) {
    const indexPath = resolve(dirPath, `${name}.${ext}`);
    if (existsSync(indexPath)) {
      return indexPath;
    }
  }

  throw new Error(
    `No file named ${name} with valid extension found in directory => ${dirPath}`,
  );
}
