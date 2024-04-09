/**
 * Prepends the file with HTML comments containing author and license info
 *
 * @type {import('@sly-cli/sly').Transformer}
 */
export default function htmlMetaComments(input, meta) {
  return [
    `<!-- Downloaded from ${meta.name} -->`,
    `<!-- License ${meta.license} -->`,
    `<!-- ${meta.source} -->`,
    input,
  ].join("\n");
}
