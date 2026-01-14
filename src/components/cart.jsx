

'use client'

import { cartState } from "@/lib/state"
import React from "react"

export const CartProducts = ({ empty_cart_children, children, wrapperClassName }) => {

  const cartProducts = cartState.use('products')
  console.log('CARTSTATE', cartProducts, empty_cart_children)
  if (!cartProducts.length) return empty_cart_children

  return (
    <div className={wrapperClassName}>
      {cartProducts.map(item => (
        React.Children.map(children, child =>  React.isValidElement(child) ? React.cloneElement(child, { item })  : child)
      ))}
    </div>
  )
}



export function CartItem({ item }) {
  return (
    <div>
      <button onClick={() => cartState.removeProduct(item.id)}>Remove</button>
    </div>
  );
}


export function CartItemQty({ item }) {
  const handleDec = () => {
    if (item.qty > 1) {
      cartState.updateQty(item.variantId, item.qty - 1)
    }
  }

  const handleInc = () => {
    cartState.updateQty(item.variantId, item.qty + 1)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={handleDec}>-</button>
      <span>{item.qty}</span>
      <button onClick={handleInc}>+</button>
    </div>
  )
}
export function CartTitle({ item }) {
  return (
      <p>{item.title}</p>
  );
}

export function CartPrice({ item }) {
  console.log('item', item)
  return (
    <>
      <p>{item?.price.amount || 'no price'}</p>
      <p>{item?.qty || 'no qty'}</p>
    </>
  );
}
