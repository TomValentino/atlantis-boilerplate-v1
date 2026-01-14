import { shopifyRequest } from "./shopify-fetch";

export function buildProductQuery(fields = "default") {
  let selectedFields = "";

  if (fields === "minimal") {
    selectedFields = `
      id
      title
      handle
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
    `;
  }

  if (fields === "default") {
    selectedFields = `
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
      variants(first: 20) {
        edges {
          node {
            id
            title
            price { amount currencyCode }
            selectedOptions { name value }
            sku
          }
        }
      }

    `;
  }

  // Allow custom fields if it looks valid
  if (fields.startsWith("id") || fields.includes("\n") || fields.includes(" ")) {
    selectedFields = fields;
  }

  return `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        ${selectedFields}
      }
    }
  `;
}


export async function getProductByHandle(handle) {
  const res = await shopifyRequest(buildProductQuery("default"), { handle });
  return normalizeProduct(res?.data?.product);
}

export async function getProductsByHandles(handles=[]) {
  const results = await Promise.allSettled(handles.map(h =>
    shopifyRequest(buildProductQuery("default"), { handle: h })
  ));
  return results.map(r => r.status === "fulfilled" ? normalizeProduct(r.value.data.product) : null).filter(Boolean);
}



// small normalizer to flatten edges/nodes reliably
export function normalizeProduct(obj) {
  if (!obj) return null;

  const product = deepFlatten(obj);
  const finalProduct = {
    ...product,
    price: {
      min: Number(product.priceRange?.minVariantPrice?.amount || 0),
      max: Number(product.priceRange?.maxVariantPrice?.amount || 0),
      currency: product.priceRange?.minVariantPrice?.currencyCode || "USD"
    }
  };
  delete finalProduct.priceRange
  return finalProduct
}

function deepFlatten(obj){
  if(Array.isArray(obj)) return obj.map(deepFlatten);
  if(obj && typeof obj === "object"){
    if(obj.edges && Array.isArray(obj.edges)) return obj.edges.map(e => deepFlatten(e.node));
    const out = {};
    for(const k in obj) out[k] = deepFlatten(obj[k]);
    return out;
  }
  return obj;
}