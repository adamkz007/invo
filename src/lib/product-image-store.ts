import { getStore } from '@netlify/blobs';

const PRODUCT_IMAGE_STORE_NAME = 'product-images';

export function getProductImageStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token =
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.NETLIFY_TOKEN ||
    process.env.AUTH_TOKEN ||
    process.env.auth_token;

  if (siteID && token) {
    return getStore({
      name: PRODUCT_IMAGE_STORE_NAME,
      siteID,
      token,
    });
  }

  return getStore(PRODUCT_IMAGE_STORE_NAME);
}
