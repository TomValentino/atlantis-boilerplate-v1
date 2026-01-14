
import {  shopifyRequest } from "@/lib/shopify-fetch"
import { buildProductQuery, getAllProductHandles } from "@/lib/shopify-queries"
export const dynamic = "force-static"
export const revalidate = false
const storeId = process.env.NEXT_PUBLIC_STORE_ID

// --- STATIC PARAMS (SSG) ---
// export async function generateStaticParams() {
//   try {
//     const handles = await getAllProductHandles()

//     if (!handles.length) {
//       console.warn("[SSG] No product handles found")
//       return []
//     }

//     const params = handles.map(handle => ({ productHandle: handle }))
//     console.log("[SSG] Prebuilding", params.length, "products")
//     return params
//   } catch (err) {
//     console.error("generateStaticParams ERROR:", err)
//     return []
//   }
// }
// --- METADATA (SSG) ---
export async function generateMetadata({ params }) {
  const { productHandle } = await params
  const result = await shopifyRequest(buildProductQuery("default"), { handle: productHandle })
  const product = flattenEdges(result.data)?.product

  if (!product) return { title: "Product not found" }

  return {
    title: product.title,
    description: product.description ?? ""
  }
}

// --- PAGE (SSG) ---
export default async function Page({ params }) {
  const { productHandle } = await params

  // 1. Get product
  const result = await shopifyRequest(buildProductQuery("default"), { handle: productHandle })
  const product = flattenEdges(result.data)?.product
  console.log('product', product)
      
  if (!product) return <h1>No product found</h1>

  return <h1>{product.title} - {product.priceRange.minVariantPrice.amount}</h1>
}




function flattenEdges(obj) {
  if (Array.isArray(obj)) {
    return obj.map(flattenEdges);
  }

  if (obj && typeof obj === "object") {
    // If object contains edges → convert them to simple array of nodes
    if (obj.edges && Array.isArray(obj.edges)) {
      return obj.edges.map(edge => flattenEdges(edge.node));
    }

    // Recursively flatten children
    const result = {};
    for (const key in obj) {
      result[key] = flattenEdges(obj[key]);
    }
    return result;
  }

  return obj;
}
