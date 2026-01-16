
'use server'

export async function shopifyRequest( query, 
  variables = {  }
) {
  try {

    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN

    // 1. Fetch
    const res = await fetch(
      `https://${storeId}.myshopify.com/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontToken
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 3600 }
      }
    )

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

    console.log('JSON', json)
    return json


  } 
  catch (err) {
    console.error("shopifyRequest ERROR:", err)
    throw err
  }
}




export async function getShopifyStorefrontToken(clerkId, storeId) {
  try {
    if (!clerkId) throw new Error("Missing clerkId");
    if (!storeId) throw new Error("Missing store handle");

    const store = await prisma.store.findFirst({
      where: {
        clerkId,
        handle: storeId
      },
      select: {
        shopifyStorefrontToken: true
      }
    });

    if (!store) {
      throw new Error("Store not found for this user + handle");
    }

    if (!store.shopifyStorefrontToken) {
      throw new Error("Storefront token not set for this store");
    }

    return store.shopifyStorefrontToken

  } 
  catch (err) {
    console.error("getShopifyStorefrontToken error:", err);
    throw err
  }
}
