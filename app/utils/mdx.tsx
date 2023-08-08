import { useMemo } from "react";
import * as mdxBundler from "mdx-bundler/client/index.js";

const customMdxComponents = {};

function getMdxComponent(code: string) {
  const Component = mdxBundler.getMDXComponent(code);
  function MdxComponent({
    components,
    ...rest
  }: Parameters<typeof Component>["0"]) {
    return (
      <Component
        components={{ ...customMdxComponents, ...components }}
        {...rest}
      />
    );
  }
  return MdxComponent;
}

export const useMdxComponent = (code: string) => {
  return useMemo(() => {
    const component = getMdxComponent(code);
    return component;
  }, [code]);
};
