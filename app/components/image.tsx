import { getImageUrlBuilder } from "#app/utils/image";

interface CloudinaryImageProps
  extends Omit<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    "src" | "srcSet" | "sizes"
  > {
  id: string;
  widths: number[];
  sizes: string[];
}
export function CloudinaryImage({
  id,
  widths,
  sizes,
  alt,
  ...imgProps
}: CloudinaryImageProps) {
  const buildImageUrl = getImageUrlBuilder(id);
  const averageWidth = Math.ceil(
    widths.reduce((a, s) => a + s) / widths.length,
  );

  const src = buildImageUrl({
    transformations: {
      resize: {
        width: averageWidth,
      },
    },
  });

  const srcSet = widths
    .map((width) =>
      [
        buildImageUrl({
          transformations: {
            resize: {
              width: width,
            },
          },
        }),
        `${width}w`,
      ].join(" "),
    )
    .join(", ");

  return (
    <img
      {...imgProps}
      alt={alt}
      src={src}
      srcSet={srcSet}
      sizes={sizes.join(", ")}
    />
  );
}
