import { db } from "#app/utils/db.server.ts";
import { unvariant } from "#app/utils/misc.ts";
import { type LoaderFunctionArgs } from "@remix-run/node";

export const getUserImgSrc = (imageId?: string | null) =>
  unvariant(!!imageId, `/resources/user-images/${imageId}`);

export async function loader({ params: { imageId } }: LoaderFunctionArgs) {
  if (!imageId) {
    throw new Response("Image ID is required", { status: 400 });
  }

  const image = await db.query.userImageTable.findFirst({
    where: (userImageTable, { eq }) => eq(userImageTable.id, imageId),
  });

  if (!image) {
    throw new Response("Not found", { status: 404 });
  }

  return new Response(image.blob, {
    headers: {
      "Content-Type": image.content_type,
      "Content-Length": Buffer.byteLength(image.blob).toString(),
      "Content-Disposition": `inline; filename="${imageId}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
