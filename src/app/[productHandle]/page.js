export const dynamic = "force-static"
export const revalidate = false

import { getAllProducts, getProduct } from "@/lib/redis"
const storeId = process.env.NEXT_PUBLIC_STORE_ID

// --- STATIC PARAMS (SSG) ---
export async function generateStaticParams() {
  const res = await getAllProducts(storeId)
  if (!res.ok) return []

  const params = res.data.map((p) => {
    console.log("[BUILD] Prebuilding:", p.handle)
    return { productHandle: p.handle }
  })

  return params
}

// --- METADATA (SSG) ---
export async function generateMetadata({ params }) {
  const { productHandle } = await params
  const product = await getProduct(storeId, productHandle)

  if (!product.ok) return { title: "Product not found" }

  return {
    title: product.data.title,
    description: product.data.description ?? ""
  }
}

// --- PAGE (SSG) ---
export default async function Page({ params }) {
  const { productHandle } = await params
  const product = await getProduct(storeId, productHandle)

  if (!product.ok) return <h1>No product found</h1>

  return <h1>{product.data.title}</h1>
}
