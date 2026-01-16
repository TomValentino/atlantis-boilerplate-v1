

'use client'

import { cartState } from "@/lib/state"
import React from "react"

export const CartProducts = ({ empty_cart_children, children, wrapperClassName }) => {

  const cartItems = cartState.use('items')
  console.log('CARTSTATE', cartItems, empty_cart_children)
  if (!cartItems.length) return empty_cart_children

  return (
    <div className={wrapperClassName}>
      {cartItems.map(item => (
        React.Children.map(children, child =>  React.isValidElement(child) ? React.cloneElement(child, { item })  : child)
      ))}
    </div>
  )
}




export const CartTotal = ({Tag = 'h1'}) => {
    const total = cartState.use('total')
    // if (!total) { return null }
    console.log('my total', total)
    return (
        <Tag>{total}</Tag>
    )
}
export const CartCount = ({Tag = 'h1'}) => {
    const count = cartState.use('count')
    if (!count) { return null }
    return (
        <Tag>{count}</Tag>
    )
}



export function CartItem({ item }) {
  console.log('ITEM', item)
  return (
    <div>
      <button onClick={() => cartState.removeProduct(item.variant.id)}>Remove</button>
    </div>
  );
}


export function CartItemQty({ item, can_remove_product = false }) {
  const handleDec = () => {
    if (item.qty > 1) {
      // Normal decrement
      cartState.updateQty(item.variant.id, item.qty - 1)
    } else if (item.qty === 1 && can_remove_product) {
      // Remove product
      cartState.updateQty(item.variant.id, 0)
    }
  }

  const handleInc = () => {
    cartState.updateQty(item.variant.id, item.qty + 1)
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
export function CartVariantTitle({ item }) {
  return (
    <>
      {item.variant.selected_options.map((item, i) => <p key={i}> {item.name} - {item.value}</p>)}
      <p>{item.product.title || "No Product title"}</p>
      <p>{item.variant.title || "No variant title"}</p>
    </>
  );
}

export function CartPrice({ item }) {
  console.log('item', item)
  return (
    <>
      <p>{item?.variant?.price || 'no price'}</p>
      <p>{item?.qty || 'no qty'}</p>
    </>
  );
}
