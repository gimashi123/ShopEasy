const PRODUCT_ASSET_BASE_URL =
  import.meta.env.VITE_PRODUCT_ASSET_BASE_URL || import.meta.env.VITE_PRODUCT_SERVICE_URL || "";

/**
 * Converts a Google Drive share/view link to a direct-embed image URL.
 * Passes through all other URLs unchanged.
 */
export function resolveGoogleDriveUrl(url: string): string {
  // https://drive.google.com/file/d/<ID>/view...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (fileMatch) return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1000`;

  // https://drive.google.com/open?id=<ID>
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w1000`;

  return url;
}

export function resolveProductImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return resolveGoogleDriveUrl(imageUrl);
  }

  // Uploaded files from product-service are typically stored as relative paths like /uploads/...
  if (imageUrl.startsWith("/") && PRODUCT_ASSET_BASE_URL) {
    return `${PRODUCT_ASSET_BASE_URL.replace(/\/$/, "")}${imageUrl}`;
  }

  return imageUrl;
}
