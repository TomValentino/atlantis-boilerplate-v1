'use server'

import { getProduct } from "@/lib/redis"


const Page = async ({ params }) => {

    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const productHandle = (await params).productHandle
    const product = await getProduct(storeId, productHandle)
    console.log('heres my product', product)

    return (
        <>
        Page
        </>
    )
}

export default Page