'use client'
import { useEffect } from "react"
import { createCartAndSetCookie } from "./prefetch-cart"

export default function SetupCart({ fetchCart }) {


  useEffect(() => {
    // initCart()

    const init = async () => {
      let cart = fetchCart  ? await fetchCart : null;

      if (!cart) {
        console.log('no cart, lets make one...')
        await createCartAndSetCookie();
        // FREE GIFTS
     
        return;
      }
      console.log('i have a cart', cart)

    }
    init()
  }, [fetchCart])

  return null
}
