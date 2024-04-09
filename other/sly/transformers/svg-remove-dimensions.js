import { parse } from "node-html-parser";

/**
 * Removes the width and height attributes from the SVG element
 *
 * @type {import('@sly-cli/sly').Transformer}
 */
export default async function svgRemoveDimensions(input) {
  const root = parse(input);
  const svg = root.querySelector("svg");
  if (!svg) throw new Error("No SVG element found");

  svg.removeAttribute("width");
  svg.removeAttribute("height");

  return root.toString();
}
