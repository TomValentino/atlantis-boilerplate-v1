'use server'

import { getProduct } from "@/lib/redis"


const Page = async ({ params }) => {

    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const productHandle = (await params).productHandle
    const product = await getProduct(storeId, productHandle)
    console.log('heres my product', product)
    if (product.ok !== true) return <h1>No product found you donut!</h1>

    return (
        <>
        Page
        <h1>      {product.data.title}</h1>
        </>
    )
}

export default Page