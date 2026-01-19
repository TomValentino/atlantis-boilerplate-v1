'use server'

// components/cart/cart-server.ts
import { cookies } from 'next/headers';
import { shopifyRequest } from '../../lib/shopify-fetch';



// -------------------------------------------------------------------------------------------//
// -------------------------------         MAIN FUNCTIONS          -------------------------- //
// -------------------------------------------------------------------------------------------//

export async function readCartCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('cartId')?.value || null
}


export async function createCartAndSetCookie() {
  const newCartId = await createCartOnShopify()
  if (!newCartId) return null
  await setCartCookie(newCartId)
  return newCartId
}

async function setCartCookie(cartId) {
  const cookieStore = await cookies();
  cookieStore.set("cartId", cartId, { path: '/' })
  return
}

// -------------------------------------------------------------------------------------------//
// -------------------------------         SHOPIFY CALLS          --------------------------- //
// -------------------------------------------------------------------------------------------//

const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      lines(first: 50) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              product {
                id
                title
                handle
              }
              id
              title
              priceV2 { amount currencyCode }
              compareAtPriceV2 { amount currencyCode } 
              selectedOptions { name value }
            }
          }
        }
      }
      estimatedCost {
        subtotalAmount { amount }
        totalAmount { amount }
      }
    }
  }
`

export async function fetchCartFromShopify(cartId) {
   try {
       const fetchRes = await shopifyRequest(GET_CART_QUERY, { cartId })
       console.log('getCart response', fetchRes)
       if (fetchRes?.errors) console.error('cart fetch graphql errors', fetchRes.errors)
   
       const cart = fetchRes?.data?.cart ?? null

       console.log('cartId used to fetch:', cartId)

       return cart
    }
    catch (err) {
        return null
    }
}

const CART_CREATE_MUTATION = `
  mutation {
    cartCreate {
      cart { id }
      userErrors { field message }
    }
  }
`


export async function createCartOnShopify() {
  try {
      const createRes = await shopifyRequest(CART_CREATE_MUTATION)

      // ⚠️ Error handling as its a MUTATION
      const userErrors = createRes?.data?.cartCreate?.userErrors
      if (userErrors && userErrors.length)   throw new Error('cartCreate userErrors: ' + userErrors.map(u=>u.message).join('; '))
      const cartId = createRes?.data?.cartCreate?.cart?.id
      if (!cartId) throw new Error('no cart id returned from cartCreate')
        
      return cartId

    } 
    catch (err) {
      console.error('Failed to create cart:', err)
      return null
    }
}


const ADD_LINE_ITEM = `
     mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { 
          id 
          lines(first: 10) { 
            edges { 
              node { 
                id 
                quantity 
                merchandise { 
                  ... on ProductVariant { 
                    id 
                    title 
                  } 
                } 
              } 
            } 
          } 
        }
        userErrors { field message }
      }
    }
  `


export async function addProductToShopifyCart(cartId, variant_id, qty) {
  console.warn('CARTI DDDD', cartId, variant_id)
  
  // Throw , or create and log?
  if (!cartId) throw new Error('No cart ID found. Cannot add item.');

  try {
    const res = await shopifyRequest(ADD_LINE_ITEM, 
      { 
        cartId, 
        lines: [
          { 
              merchandiseId: variant_id, 
              quantity: qty 
          }
        ] 
    }
    );
    console.log("RES", res)
    if (!res?.data?.cartLinesAdd?.cart) {
      throw new Error('NO PRODUCT?')
    }
    return res.data
  } 
  catch (err) {
    console.error("getProductByHandle ERROR:", err);
    return null; // or return { error: true }
  }
}


