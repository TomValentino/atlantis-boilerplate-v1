'use client'

import { cartState, overlayState } from "@/lib/state"



export const MyButty = ({id}) => {

    const handleClick = () =>{
        // overlayState.toggle(id)
        cartState.toggleCart()
    }

    return (
        <button onClick={() => handleClick()}>Click her</button>
    )
}