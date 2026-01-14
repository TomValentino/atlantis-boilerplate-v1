'use client'
import { cartState } from '@/lib/state';
import { useRef } from 'react'



export function SetupCart({ cartPromise }) {
    const initialized = useRef(false)

      if (!initialized.current) {

          const init = async () => {
            let cart = cartPromise ? await cartPromise : null;

            if (!cart) {
              // Run function to create and set cookie
              return;
            }

            // Now init the items that we fetched
            cartState.setProducts([ ],)

          };

          init();


        initialized.current = true

      }


  return null;
}

