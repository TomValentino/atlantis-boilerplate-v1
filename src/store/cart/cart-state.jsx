'use client'
import { useEffect } from "react"
import { createCartAndSetCookie, readCartCookie, fetchCartFromShopify, addProductToShopifyCart } from "./cart-server"
import { createCustomState } from "../../lib/state"

// Runs in MAIN layout. Later could cache and revalidate when cart changes?
export default function SetupCart() {
  useEffect(() => {
    const init = async () => {
      let cartID = await readCartCookie()
      if (!cartID) {
        const newCartId = await createCartAndSetCookie()
        if (!newCartId) return console.error('ERROR setting up cart') // err handling
        cartState.initCartItems([], newCartId)
      }
      else {
        const cart = await fetchCartFromShopify(cartID)
        if (!cart) return console.error('ERROR FETCHING CART')
        const formattedItems =
          cart?.lines?.nodes?.map(item => {
            const variant = item.merchandise
            const product = variant.product
            return createStateCartItem(product, variant, item.quantity)
          }) || []
        cartState.initCartItems(formattedItems, cart.id)
      }
    }
    init()
  }, [])

  return null
}


export const cartState = createCustomState(
  {
    isLoaded: false,
    hasOpened: false,
    show: false,
    isAdding: false,
    items: [],
    total: 0,
    count: 0, // number of items
  },
  {

    setCartId: ({set}, id) => set('id', id),
    // Show/hide cart
    showCart: ({ get, set }) => {
      if (!get('hasOpened')) set('hasOpened', true)
      set('show', true)
    },

    hideCart: ({ set }) => set('show', false),

    toggleCart: ({ get, set }) => {
      const isOpen = get('show')

      // If it's going to open now, mark it as opened once
      if (!isOpen && !get('hasOpened')) {
        set('hasOpened', true)
      }

      // Flip open/closed
      set('show', !isOpen)
    },


    // Completely set products array
    initCartItems: ({set, get}, initialItems, cartId) => {
      console.log('initialItems', initialItems)
      set('isLoaded', true)
      if (!get('items').length) {
        set('items', initialItems) // just set it
        set('total', initialItems.reduce((s, i) => s + ((i.variant.price || 0) * (i.qty || 1)), 0))
      }
      // NO notify here → subscribers won't be called
    },

    // Add a product (or increase qty if exists)
    addCartItem: async ({ get, set }, product, variant, qty = 1) => {
      console.log(variant)
      if (!product || !variant) return

      // ---------- SNAPSHOT FOR ROLLBACK ----------
      const prevItems = get('items') || []
      const prevCount = get('count')
      const prevTotal = get('total')
      const prevHasOpened = get('hasOpened')
      const prevShow = get('show')

      // ---------- APPLY LOCAL OPTIMISTIC UPDATE ----------
      let newItems
      const existing = prevItems.find(item => item.variant.id === variant.id)

      if (existing) {
        newItems = prevItems.map(item =>
          item.variant.id === variant.id ? { ...item, qty: item.qty + qty } : item
        )
      } 
      else {
        newItems = [...prevItems, createStateCartItem(product, variant, qty)]
      }

      set('items', newItems)
      set('count', newItems.reduce((s, i) => s + (i.qty || 1), 0))
      set('total', newItems.reduce((s, i) => s + ((i.variant.price || 0) * (i.qty || 1)), 0))

      if (!prevHasOpened) set('hasOpened', true)
      set('show', true)

      // ---------- TRY SHOPIFY ADD ----------
      try {
        const cartId = await readCartCookie()
        const addItemToShopify = await addProductToShopifyCart(cartId, variant.id, qty)
        console.log('addItemToShopify', addItemToShopify)
        // SUCCESS → keep everything
        return
      }

      // ---------- ROLLBACK ON FAILURE ----------
      catch (err) {
        console.error('ERROR adding to Shopify — rolling back', err)

        set('items', prevItems)
        set('count', prevCount)
        set('total', prevTotal)
        set('hasOpened', prevHasOpened)
        set('show', prevShow)
      }
    },


    // Update quantity for a variant
    updateQty: ({ get, set }, variantId, newQty) => {
      if (!variantId) return

      const items = get('items') || []
      const existing = items.find(item => item.variant.id === variantId)
      if (!existing) return

      let updatedItems

      if (newQty < 1) {
        // Qty is going below 1 -> remove the product
        updatedItems = items.filter(item => item.variant.id !== variantId)
      } else {
        // Normal update
        updatedItems = items.map(item =>
          item.variant.id === variantId ? { ...item, qty: newQty } : item
        )
      }

      set('items', updatedItems)
      set('count', updatedItems.reduce((s, i) => s + (i.qty || 1), 0))
      set('total', updatedItems.reduce((s, i) => s + ((i.variant.price || 0) * (i.qty || 1)), 0))
    },

    // Remove a product
    removeProduct: ({ get, set }, variantId) => {
      if (!variantId) return

      const items = get('items') || []
      const filtered = items.filter(item => item.variant.id !== variantId)

      set('items', filtered)
      set('count', filtered.reduce((s, i) => s + (i.qty || 1), 0))
      set('total', filtered.reduce((s, i) => s + ((i.variant.price || 0) * (i.qty || 1)), 0))
    },

    // Clear everything
    clearCart: ({ set }) => {
      set('items', [])
      set('count', 0)
      set('total', 0)
      set('show', false)
    }
  }
)





export const createStateCartItem = (product, variant, qty) => {
  const formattedCartItem = 
    {
      variant: {
        id: variant.id,
        title: variant.title,
        selected_options: variant?.selected_options || variant?.selectedOptions,
        // image: variant?.image?.url || null ,
        price: variant?.price || variant.priceV2.amount,
        compare_at_price: variant?.compare_at_price || variant.compareAtPriceV2.amount,
      },
      product: {
        id: product.id,
        title: product.title,
        // price: product?.price || product.priceV2.amount,
        // max_price: product.max_price,
        handle: product.handle,
        // featured_image: product?.featured_image || product.featuredImage.url,
      },
      qty,
    }
  return formattedCartItem
}