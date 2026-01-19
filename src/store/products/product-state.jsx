'use client'
import { useRef } from "react";
import { createCustomState } from "../../lib/state";


// -------------------------------------------------------------------------------------------//
// -------------------------------         PRODUCTS           ------------------------------- //
// -------------------------------------------------------------------------------------------//

export function SetupProductState({  product = null, products = [] }) {
  const didInit = useRef(false);
  
  if (!didInit.current) {
    didInit.current = true;
    console.log('product', product)
    console.log('products', products)
    productsState.setProducts(product, products)
  }

  return null
  
}


export const productsState = createCustomState(
  {
    default_product: {},   // main product (single)
    extra_products: {},    // keyed by handle
  },
  {
    setProducts: ({ set, setKey }, defaultProduct, productsArray) => {
      // set default product
      if (defaultProduct?.handle) {
        set("default_product", defaultProduct)
      } else {
        console.warn("setProducts → default product missing handle", defaultProduct)
      }

      // set all extra products
      if (Array.isArray(productsArray)) {
        productsArray.forEach((p) => {
          if (!p?.handle) {
            console.warn("setProducts → product missing handle:", p)
            return
          }
          setKey("extra_products", p.handle, p)
        })
      }
    },
  }
)

export const useProduct = (handle = null) => {
  const defaultProduct = productsState.use("default_product");
  const extraProducts = productsState.use("extra_products");

  if (!handle) return defaultProduct;

  return extraProducts?.[handle] || null;
};



// -------------------------------------------------------------------------------------------//
// -------------------------------         VARIANT SELECTOR           ------------------------ //
// -------------------------------------------------------------------------------------------//


export const variantSelectorState = createCustomState(
  {
    selectors: {},
  },
  {
    init: ({ get, set }, id, firstVariant) => {
      const selectors = get("selectors")
      if (selectors[id]) return

      set("selectors", {
        ...selectors,
        [id]: {
          qty: 1,
          selectedVariantId: firstVariant.id,
        },
      })
    },

    setVariant: ({ get, set }, id, variantId) => {
      const selectors = get("selectors")
      set("selectors", {
        ...selectors,
        [id]: {
          ...selectors[id],
          selectedVariantId: variantId,
        },
      })
    },

    setQty: ({ get, set }, id, qty) => {
      const selectors = get("selectors")
      set("selectors", {
        ...selectors,
        [id]: {
          ...selectors[id],
          qty,
        },
      })
    },
  }
)


export const useVariantSelector = (id) => {
  const selectors = variantSelectorState.use("selectors")
  return selectors[id]
}
