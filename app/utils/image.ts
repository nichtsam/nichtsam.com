import {
  buildImageUrl as _buildImageUrl,
  setConfig,
} from "cloudinary-build-url";
import type { CldOptions } from "@cld-apis/types";

setConfig({
  cloudName: "nichtsam",
});

export function getImageUrlBuilder(id: string) {
  return (cldOptions: CldOptions = {}) => _buildImageUrl(id, cldOptions);
}
