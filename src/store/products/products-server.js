'use server'
import { formatProduct, reformatShopifyObj } from "../../lib/shopify-reformat";
import { shopifyRequest } from "../../lib/shopify-fetch";

const PRODUCT_QUERY = `
    query ProductByHandle($handle: String! ) {
      product(handle: $handle) {
        id
        title
        handle
        description
        tags
        featuredImage { url altText }
        images(first: 20) {
          edges { node { url altText } }
        }
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
  metafield(namespace: "custom", key: "color_variations") {
  
      
              value
           
}
        variants(first: 20) {
          edges {
            node {
              id
              title
              priceV2 { amount currencyCode }
              compareAtPriceV2 { amount currencyCode } 
              selectedOptions { name value }
              
            }
          }
        }
      }
    }
  `;



export async function getProductByHandle(handle) {
  try {
    const res = await shopifyRequest(PRODUCT_QUERY, { handle });
    const product = reformatShopifyObj(res?.data?.product);
    return formatProduct(product);
  } 
  catch (err) {
    console.error("getProductByHandle ERROR:", err);
    return null; 
  }
}


export async function getProductsByHandles(handles = []) {
  const results = await Promise.allSettled(
    handles.map(h => shopifyRequest(PRODUCT_QUERY, { handle: h }))
  );

  return results
    .map(r => r.status === "fulfilled" ? reformatShopifyObj(r.value.data.product) : null)
    .filter(Boolean)
    .map(formatProduct);
}








