"use client";
import { collectionPageState } from "@/store/collection/collection-state";
import { useState, useLayoutEffect } from "react";

export default function ClientPage({ initialProducts }) {
  // Match server on first render → no hydration mismatch
  const [products, setProducts] = useState(initialProducts);

  const collection = collectionPageState.use('collection')
  const isLoading = collectionPageState.use('isLoading')

  if (isLoading) return <>Loading state......</>
  if (!collection) return <>NO COLLECTION !</>



  const addMoreProducts = (newProducts) => {
    const updated = [...products, ...newProducts];
    const newCollection = {
        ...collection,
        products: updated,
    }
    console.log('UPDATE', updated)
    localStorage.setItem(`collection-state-${collection.handle}`, JSON.stringify(newCollection));
  };

  return (
    <div>
        <pre>{JSON.stringify(collection.products, null, 2)}</pre>
      {/* <pre>{JSON.stringify(products, null, 2)}</pre> */}
      <button onClick={() => addMoreProducts([product])}>
        Add More
      </button>
    </div>
  );
}


const product = {
    "id": "gid://shopify/Product/3443344334",
    "handle": "sugar-baby-doll-bustier-intimate-set-stocking-pink",
    "title": "Sugar Baby Doll Bustier Intimate Set + Stocking - Pink",
    "featured_image": {
      "url": "https://cdn.shopify.com/s/files/1/0500/1055/4539/files/IMG_88042.jpg?v=1738855257",
      "alt": ""
    },
    "images": [],
    "variants": [
      {
        "id": "gid://shopify/ProductVariant/47031706583272",
        "title": "XS",
        "price": "339000.0",
        "compare_at_price": "499000.0",
        "selected_options": [
          {
            "name": "Size",
            "value": "XS"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/47031706616040",
        "title": "S",
        "price": "339000.0",
        "compare_at_price": "499000.0",
        "selected_options": [
          {
            "name": "Size",
            "value": "S"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/47031706648808",
        "title": "M",
        "price": "339000.0",
        "compare_at_price": "499000.0",
        "selected_options": [
          {
            "name": "Size",
            "value": "M"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/47031706681576",
        "title": "L",
        "price": "339000.0",
        "compare_at_price": "499000.0",
        "selected_options": [
          {
            "name": "Size",
            "value": "L"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/47031706714344",
        "title": "XL",
        "price": "339000.0",
        "compare_at_price": "499000.0",
        "selected_options": [
          {
            "name": "Size",
            "value": "XL"
          }
        ]
      },
      {
        "id": "gid://shopify/ProductVariant/47031706747112",
        "title": "XXL",
        "price": "339000.0",
        "compare_at_price": "499000.0",
        "selected_options": [
          {
            "name": "Size",
            "value": "XXL"
          }
        ]
      }
    ],
    "price": 339000,
    "max_price": 339000,
    "metafield": {
      "value": "Pink"
    }
  }