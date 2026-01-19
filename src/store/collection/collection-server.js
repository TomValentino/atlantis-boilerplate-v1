'use server'

import { shopifyRequest } from "@/lib/shopify-fetch";
import { formatProduct, reformatShopifyObj } from "@/lib/shopify-reformat";



// -------------------------------------------------------------------------------------------//
// -------------------------------         HANDLES           ------------------------------- //
// -------------------------------------------------------------------------------------------//

export async function getCollectionByHandle(handle, productsLimit = 5, vars) {
  const res = await shopifyRequest(shopifyCollectionQuery(productsLimit), { handle });
  const collection = reformatShopifyObj(res?.data?.collection);
 if (!collection?.products) return collection;
  return {
    ...collection,
    products: collection.products.map(p => formatProduct(p))
  };}

export async function getCollectionsByHandles(data = [], productsLimit = 5) {
  const results = await Promise.allSettled(
    data.map(({ handle }) =>
      shopifyRequest(shopifyCollectionQuery(productsLimit), vars)
    )
  );

  return results
    .map(r => {
      if (r.status !== "fulfilled") return null;
      const collection = reformatShopifyObj(r.value.data.collection);
      if (!collection) return null;

      // process products if they exist
      return {
        ...collection,
        products: collection.products?.map(p => formatProduct(p)) || []
      };
    })
    .filter(Boolean); // remove nulls
}
const vars = {
  handle: "valentines-sale",
  first: 5,
  after: null,
  filters: [
 
    // {
    //  variantOption: {
    //     name: "Size",
    //     value: "XXL"
    //     }
    // }
  ]
}


function shopifyCollectionQuery() {
  return `
    query CollectionByHandle(
      $handle: String!,
      $first: Int!,
      $after: String,
      $filters: [ProductFilter!]
    ) {
      collection(handle: $handle) {
        id
        title
        handle
        description
        image { url altText }

        products(first: $first, after: $after, filters: $filters) {
          edges {
            cursor
            node {
              id
              title
              handle
              featuredImage { url altText }
              priceRange {
                minVariantPrice { amount currencyCode }
                maxVariantPrice { amount currencyCode }
              }
                metafield(namespace: "custom", key: "current_color_variation_title_e_g_red_") {
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
                    sku
                  }
                }
        }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  `
}











export async function fetchCollection({
  handle,
  first = 24,
  after = null,
  filters = [],
  sortKey = "MANUAL",
  reverse = false
}) {
  const variables = { handle, first, after, filters, sortKey, reverse }

  const res = await shopifyRequest(collectionQuery, variables)
  const raw = res?.data?.collection
  const data = reformatShopifyObj(raw)

  return {
    ...data,
    products: data?.products?.map(formatProduct) || [],
    pageInfo: raw?.products?.pageInfo || {}
  }
}

const collectionQuery = `
  query CollectionByHandle(
  $handle: String!,
  $first: Int!,
  $after: String,
  $filters: [ProductFilter!],
  $sortKey: ProductCollectionSortKeys,
  $reverse: Boolean
) {
  collection(handle: $handle) {
    id
    title
    handle
    description
    image { url altText }

    products(
      first: $first,
      after: $after,
      filters: $filters,
      sortKey: $sortKey,
      reverse: $reverse,
    ) {
      edges {
        cursor
        node {
          id
          title
          handle
          featuredImage { url altText }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
            metafield(namespace: "custom", key: "color") {
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
                sku
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}

`


const testFilters = [
  { productType: "lingerie" },
  { productVendor: "secret-love" },
  { available: true },
  { price: { min: 300, max: 900 } },
  { tag: "pink" },
  {
    variantOption: {
      name: "Size",
      value: "XL"
    }
  },
  {
    productMetafield: {
      namespace: "custom",
      key: "material",
      value: "lace"
    }
  }
]

