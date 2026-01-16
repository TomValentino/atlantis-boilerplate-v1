
import { shopifyRequest } from "./shopify-fetch";




// -----------------------------------------------------------------
// NORMALIZERS
// -----------------------------------------------------------------
export function formatProduct(shopifyProduct) {
  if (!shopifyProduct) return null;

  // Flattened images
  const images = shopifyProduct.images?.length ? shopifyProduct.images.map(img => ({ url: img.url, alt: img.altText || ""})) : [];

  // Fallback for featured image
  const featured_image = shopifyProduct.featuredImage
    ? { url: shopifyProduct.featuredImage.url, alt: shopifyProduct.featuredImage.altText || "" }
    : images[0] || null;

  // Flattened variants
  const variants = shopifyProduct.variants?.length
    ? shopifyProduct.variants.map(v => ({
        id: v.id,
        title: v.title,
        price: v.priceV2?.amount || null,
        compare_at_price: v.compareAtPriceV2?.amount || null,
        selected_options: v.selectedOptions?.map(o => ({ name: o.name, value: o.value })) || []
      }))
    : [];

  // Min/max price from variants or priceRange
  const price = parseFloat(shopifyProduct.priceRange.minVariantPrice.amount)
  const max_price = parseFloat(shopifyProduct.priceRange.maxVariantPrice.amount)

  return {
    id: shopifyProduct.id,
    handle: shopifyProduct.handle,
    title: shopifyProduct.title,
    description: shopifyProduct.description,
    featured_image,
    images,
    variants,
    price,
    max_price
  };
}

function normalizeProductsInCollection(collection) {
  if (!collection?.products) return collection;
  return {
    ...collection,
    products: collection.products.map(p => formatProduct(p))
  };
}

export const createStateCartItem = (product, variant, qty) => {
  const formattedCartItem = 
    {
      line_id: null,
      variant: {
        id: variant.id,
        title: variant.title,
        selected_options: variant.selected_options,
        image: '',
        price: variant.price,
        compare_at_price: variant.compare_at_price,
      },
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        max_price: product.max_price,
        handle: product.handle,
        featured_image: product.featured_image,
      },
      qty,
    }
  return formattedCartItem
}





// -----------------------------------------------------------------
// PRODUCT
// -----------------------------------------------------------------


export function shopifyProductQuery() {
  // Later can add functionality to customize what data to fetch.
  return `
    query ProductByHandle($handle: String!) {
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
        variants(first: 20) {
          edges {
            node {
              id
              title
              priceV2 { amount currencyCode }
              compareAtPriceV2 { amount currencyCode } 
              selectedOptions { name value }
              sku
            }
          }
        }
      }
    }
  `;
}

export async function getProductByHandle(handle) {
  try {
    const res = await shopifyRequest(shopifyProductQuery(), { handle });
    const product = reformatShopifyObj(res?.data?.product);
    return formatProduct(product);
  } 
  catch (err) {
    console.error("getProductByHandle ERROR:", err);
    return null; // or return { error: true }
  }
}


export async function getProductsByHandles(handles = []) {
  const results = await Promise.allSettled(
    handles.map(h => shopifyRequest(shopifyProductQuery(), { handle: h }))
  );

  return results
    .map(r => r.status === "fulfilled" ? reformatShopifyObj(r.value.data.product) : null)
    .filter(Boolean)
    .map(formatProduct);
}






// -----------------------------------------------------------------
// COLLECTION QUERIES
// -----------------------------------------------------------------

export function shopifyCollectionQuery(productsLimit = 5) {
  return `
    query CollectionByHandle($handle: String!) {
      collection(handle: $handle) {
        id
        title
        handle
        description
        image { url altText }  # collection image
        products(first: ${productsLimit}) {
          edges {
            node {
              id
              title
              handle
              featuredImage { url altText }  # correct product image
              priceRange {
                minVariantPrice { amount currencyCode }
                maxVariantPrice { amount currencyCode }
              }
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                    priceV2 { amount currencyCode }
                    compareAtPriceV2 { amount currencyCode } 
                    selectedOptions { name value }
                    sku
                  }
                }
        }
            }
          }
        }
      }
    }
  `;
}

export async function getCollectionByHandle(handle, productsLimit = 5) {
  const res = await shopifyRequest(shopifyCollectionQuery(productsLimit), { handle });
  const collection = reformatShopifyObj(res?.data?.collection);
  return normalizeProductsInCollection(collection);
}

export async function getCollectionsByHandles(data = [], productsLimit = 5) {
  const results = await Promise.allSettled(
    data.map(({ handle }) =>
      shopifyRequest(shopifyCollectionQuery(productsLimit), { handle })
    )
  );

  return results
    .map(r => r.status === "fulfilled" ? reformatShopifyObj(r.value.data.collection) : null)
    .filter(Boolean)
    .map(normalizeProductsInCollection);
}






// -----------------------------------------------------------------
// HELPER
// -----------------------------------------------------------------
function reformatShopifyObj(obj){
    if (!obj) return null;

  if(Array.isArray(obj)) return obj.map(reformatShopifyObj);
  if(obj && typeof obj === "object"){
    if(obj.edges && Array.isArray(obj.edges)) return obj.edges.map(e => reformatShopifyObj(e.node));
    const out = {};
    for(const k in obj) out[k] = reformatShopifyObj(obj[k]);
    return out;
  }
  return obj;
}
