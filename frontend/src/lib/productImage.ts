const PRODUCT_ASSET_BASE_URL =
  import.meta.env.VITE_PRODUCT_ASSET_BASE_URL || import.meta.env.VITE_PRODUCT_SERVICE_URL || "";

export function resolveProductImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;

  // Uploaded files from product-service are typically stored as relative paths like /uploads/...
  if (imageUrl.startsWith("/") && PRODUCT_ASSET_BASE_URL) {
    return `${PRODUCT_ASSET_BASE_URL.replace(/\/$/, "")}${imageUrl}`;
  }

  return imageUrl;
}
