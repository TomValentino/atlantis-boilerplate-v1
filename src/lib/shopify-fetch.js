
'use server'

export async function shopifyRequest( query,  variables = {  },revalidate = 0 ) {
  try {

    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN

    // 1. Fetch
    const res = await fetch(
      `https://${storeId}.myshopify.com/api/2025-07/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontToken
        },
        body: JSON.stringify(
          { 
            query, 
            variables 
          }
        ),
        next: revalidate > 0 ? { revalidate } : undefined
      }
    )

    // 2. Validate
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Shopify HTTP Error (${res.status}): ${text}`)
    }

    // 3. Parse JSON
    const json = await res.json()
    if (json.errors) {
      console.error("Shopify GraphQL Errors:", json.errors)
      throw new Error("Shopify GraphQL Error: " + JSON.stringify(json.errors))
    }

    return json

  } 
  catch (err) {
    console.error("shopifyRequest ERROR:", err)
    throw err
  }
}

