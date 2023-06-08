import { useMemo } from "react";
import { getMDXComponent } from "mdx-bundler/client";

export const useMdxComponent = (code: string) => {
  return useMemo(() => {
    const component = getMDXComponent(code);
    return component;
  }, [code]);
};
