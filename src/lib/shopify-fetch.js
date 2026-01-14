
'use server'

// Create a function that will:
    // 1. Get users shopify credentials: what do we need?
    // 2. Run the fetch to shopify to get the 1) product 2) products (if multiple - how?) 


// Used for: Onload: fetch all products for product state, builder -> 


export async function shopifyRequest(
    query, 
  variables = { handle: "ghia-open-crotch-dots-bodysuit-burgundy" }
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


  } catch (err) {
    console.error("shopifyRequest ERROR:", err)
    return { error: true, message: err.message }
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

    return {
      ok: true,
      token: store.shopifyStorefrontToken
    };

  } catch (err) {
    console.error("getShopifyStorefrontToken error:", err);

    return {
      ok: false,
      error: err.message || "Unknown error"
    };
  }
}
