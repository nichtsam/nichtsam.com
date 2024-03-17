import { existsSync, statSync } from "fs";
import { readFile, readdir } from "fs/promises";
import { relative, resolve } from "path";
import { rootPath, getFilePathInDirectoryByName } from "../path.server";

type Files = Record<string, string>;
export type MdxBundleSource = {
  source: string;
  files?: Files;
};

type Entry = {
  name: string;
  isFile: boolean;
  bundlePath: string;
  mdxPath: string;
};

const mdxDirPath = resolve(rootPath, "mdx");
const VALID_EXTENSION = ["md", "mdx"];

export function getMdxEntry(category: string, name: string): Entry {
  const maybeDirPath = resolve(mdxDirPath, category, name);
  if (existsSync(maybeDirPath)) {
    const dirPath = maybeDirPath;
    return {
      name,
      isFile: false,
      bundlePath: dirPath,
      mdxPath: getFilePathInDirectoryByName(dirPath, "index", VALID_EXTENSION),
    };
  }

  const filePath = getFilePathInDirectoryByName(
    resolve(mdxDirPath, category),
    name,
    VALID_EXTENSION,
  );

  return {
    name,
    isFile: true,
    bundlePath: filePath,
    mdxPath: filePath,
  };
}

export async function getMdxBundleSource(
  entry: Entry,
): Promise<MdxBundleSource> {
  const sourcePromise = readFile(entry.mdxPath, "utf-8");
  const filesPromise = entry.isFile
    ? undefined
    : getFilesInDirectory(entry.bundlePath);
  const [source, files] = await Promise.all([sourcePromise, filesPromise]);

  return { source, files };
}

async function getFilesInDirectory(
  currentPath: string,
  rootPath: string = currentPath,
): Promise<Files> {
  if (!existsSync(currentPath)) {
    return {};
  }

  if (statSync(currentPath).isFile()) {
    const relativePath = relative(rootPath, currentPath);

    return {
      [relativePath]: await readFile(currentPath, "utf-8"),
    };
  } else {
    const dir = await readdir(currentPath, { withFileTypes: true });

    const fileSets = await Promise.all(
      dir.map((dirent) =>
        getFilesInDirectory(resolve(dirent.path, dirent.name), rootPath),
      ),
    );

    const files = fileSets.reduce<Files>((acc, files) => {
      return Object.assign(acc, files);
    }, {});

    return files;
  }
}
