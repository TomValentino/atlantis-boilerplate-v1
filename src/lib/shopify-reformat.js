

export function formatProduct(shopifyProduct) {
  if (!shopifyProduct) return null;
  // Flattened images
  const images = shopifyProduct.images?.length ? shopifyProduct.images.map(img => ({ url: img.url, alt: img.altText || ""})) : [];

  // Fallback for featured image
  const featured_image = shopifyProduct.featuredImage
    ? { url: shopifyProduct.featuredImage.url, alt: shopifyProduct.featuredImage.altText || "" }
    : images[0] || null;

  // Flattened variants
  const variants = shopifyProduct.variants?.length
    ? shopifyProduct.variants.map(v => ({
        id: v.id,
        title: v.title,
        price: v.priceV2?.amount || null,
        compare_at_price: v.compareAtPriceV2?.amount || null,
        selected_options: v.selectedOptions?.map(o => ({ name: o.name, value: o.value })) || []
      }))
    : [];

  // Min/max price from variants or priceRange
  const price = parseFloat(shopifyProduct.priceRange.minVariantPrice.amount)
  const max_price = parseFloat(shopifyProduct.priceRange.maxVariantPrice.amount)

  return {
    id: shopifyProduct.id,
    handle: shopifyProduct.handle,
    title: shopifyProduct.title,
    description: shopifyProduct.description,
    featured_image,
    images,
    variants,
    price,
    max_price,
        metafield: shopifyProduct.metafield || null

  };
}




export function reformatShopifyObj(obj){
    if (!obj) return null;
  if(Array.isArray(obj)) return obj.map(reformatShopifyObj);
  if(obj && typeof obj === "object"){
    if(obj.edges && Array.isArray(obj.edges)) return obj.edges.map(e => reformatShopifyObj(e.node));
    const out = {};
    for(const k in obj) out[k] = reformatShopifyObj(obj[k]);
    return out;
  }
  return obj;
}


