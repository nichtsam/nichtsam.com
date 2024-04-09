import prettier from "prettier";

/**
 * Prettifies the input HTML
 *
 * @type {import('@sly-cli/sly').Transformer}
 */
export default function htmlPrettify(input) {
  return prettier.format(input, {
    parser: "html",
  });
}
