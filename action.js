'use server'

import { cookies } from 'next/headers';

export async function setCartCookie() {
  (await cookies()).set("cartId", "BITCH", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: false,
  });
}

export const readAFUCKINGCOOKIE = async ()=>{ 
      const cartId = (await cookies()).get("cartId")?.value;
      return cartId

}



