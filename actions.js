'use server'
import { cookies } from "next/headers";

export async function createCartCookie(id) {
  (await cookies()).set('cartId', id, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7
  });

  return id;
}
