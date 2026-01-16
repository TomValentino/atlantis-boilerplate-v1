'use client'
import { useEffect } from "react"
import { createCartAndSetCookie, prefetchCart } from "./prefetch-cart"
import { createStateCartItem } from "@/lib/shopify-queries"
import { cartState } from "@/lib/state"

export default function SetupCart() {

  useEffect(() => {
    const init = async () => {
      const cart = await prefetchCart()

      if (!cart) {
        console.log('No cart, creating one...')
        await createCartAndSetCookie()
        return
      }

      console.log('Cart fetched:', cart)

      const formattedItems = cart.lines?.edges?.map(({ node }) => {
        const variant = node.merchandise  // THIS is the variant
        return createStateCartItem(node.product, variant, node.quantity)
      }) || []

      cartState.initCartItems([
        {
          "line_id": null,
          "variant": {
              "id": "gid://shopify/ProductVariant/47964716335336",
              "title": "XS",
              "selected_options": [
                  {
                      "name": "Size",
                      "value": "XS"
                  }
              ],
              "image": "",
              "price": "189000.0",
              "compare_at_price": "399000.0"
          },
          "product": {
              "id": "gid://shopify/Product/9300623622376",
              "title": "Milky Lace Suspender Skirt - Black",
              "price": 189000,
              "max_price": 189000,
              "handle": "milky-lace-suspender-skirt-black",
              "featured_image": {
                  "url": "https://cdn.shopify.com/s/files/1/0500/1055/4539/files/E58BF2D9-B0FC-45FD-B35C-05A25C3D322C.jpg?v=1768005933",
                  "alt": ""
              }
          },
          "qty": 1
      }
      ]) // <-- init all at once
      if (formattedItems.length > 0) {
      }
    }

    init()
  }, [])

  return null
}
