'use server'

import { cookies } from "next/headers"

export default async function ServerBitch() {
  const cookieStore = await cookies();        // ← correct
  const c = cookieStore.get('cartId');  // ← works

  console.log("COOKIE ON SERVER:", c);

  return <div>ServerBitch</div>
}
