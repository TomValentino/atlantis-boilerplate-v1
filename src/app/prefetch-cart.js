'use server'
import { shopifyRequest } from "@/lib/shopify-fetch";
import { cookies } from "next/headers";


// -----------------------------------------------------------------
// CART SETUP
// -----------------------------------------------------------------

// 1. This runs on MAIN LAYOUT --> and then pass the fetchCart to setup-cart.jsx
export async function prefetchCart() {
  const cartId = (await cookies()).get("cartId")?.value;
  if (!cartId)  return null;
  return fetchCartFromShopify(cartId)
}

const fetchCartFromShopify = async (cartId) => {
  // Todo : Error handling? OR all done in shopify request?
  const res = await shopifyRequest(fetchShopifyCartQuery(), { cartId });
  return res.data.cart
}

function fetchShopifyCartQuery() {
  return `
      query GetCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id                                # Variant ID
                    title                             # Variant title (Size const)
                    image { url altText }             # Variant image (preferred)
                    priceV2 { amount }   # Normal price
                    compareAtPriceV2 { amount } # Compare at price if available
                    product {
                      id
                      title                           # Product title
                      handle                          # Product handle
                      images(first: 1) {              # Product image fallback
                        edges {
                          node { url altText }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          estimatedCost {
            subtotalAmount { amount }
            totalAmount { amount  }
          }
        }
      }
    `
}


// Run from the CLIENT (setup-cart.jsx) IF there is no cart cookie.
export async function createCartAndSetCookie() {
  // Todo : Error handling? OR all done in shopify request?
  const newCartRes = await shopifyRequest(createShopifyCart(), {});
  const newCart = newCartRes.data?.cartCreate?.cart;

  // Todo: Finalise error handling
  if (!newCart?.id) throw new Error("No cart ID returned.");

  (await cookies()).set("cartId", newCart.id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  });

  return newCart.id;
}

function createShopifyCart() {
  return `
    mutation {
      cartCreate {
        cart { id }
      }
    }
  `;
}
