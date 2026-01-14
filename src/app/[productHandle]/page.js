import { getCachedDB } from "@/lib/cached-db"
import {  getProductByHandle, getProductsByHandles } from "@/lib/shopify-queries"
import Link from "next/link"
import { renderElement } from "@/lib/render"
import { cartState } from "@/lib/state"
import { MyButty } from "./client-test"
import { SetupCollectionState, SetupOverlays, SetupProductState } from "@/components/overlays"


export const dynamic = "force-static"
export const revalidate = false

// --- STATIC PARAMS (SSG) ---
// export async function generateStaticParams() {

// }

// --- METADATA (SSG) ---
// export async function generateMetadata({ params }) {
  
// }

// --- PAGE (SSG) ---
export default async function Page({ params }) {

  const { productHandle } = await params    
  const product = await getProductByHandle(productHandle); // Todo: Add cusotmisation on what to fetch..?
  if(!product) return <h1>Not found</h1>;

  const db = await getCachedDB();
  const product_template = matchProductHandleToProductTemplate(db, productHandle)
  const handles = extractAllProductHandles(product_template);
  const products = await getProductsByHandles(handles);
  console.log("%cHere is my product:", "color: gold; font-weight: bold;", product);
  console.log("%cHere is my products:", "color: gold; font-weight: bold;", products);

  // Collections state is changeable - must be custom
  const collection_handles = extractAllCollectionHandles(product_template)


  return (
    <>
      <SetupCollectionState collection={demoCollection} collections={demoCollections}/>
      <SetupProductState product={product} products={products} />
      <SetupOverlays overlays={db.overlays} product={product} products={products} />

      {
        product_template.children.map(item => {
          return renderElement(item, { product });
        })
      }
      <button>
        <Link href="/cameira-floral-sleepwear-robe-dusty-blue">Floral sleepwear - using default</Link>
      </button>
      <button>
        <Link href="/milky-lace-suspender-skirt-black">Black skirt - using minimal</Link>
      </button>
      <MyButty id={454} />
    </>
  )
}




// -------------------------
// Helpers
// -------------------------

export const demoCollection = {
  id: "gid://shopify/Collection/1234567890",
  handle: "summer-2026",
  title: "Summer 2026 Collection",
  description: "A fresh selection of summer wear for 2026.",
  featured_image: {
    url: "https://cdn.shopify.com/s/files/1/1234/5678/collections/summer-2026.jpg",
    altText: "Summer 2026 Collection Cover"
  },
  products: [
    {
      id: "gid://shopify/Product/1001",
      handle: "cameira-floral-sleepwear-robe-dusty-blue",
      title: "Massive Dildo",
      description: "Light and breezy summer dress.",
      featured_image: {
        url: "https://cdn.shopify.com/s/files/1/1234/5678/products/sunny-dress.jpg",
        altText: "Sunny Dress Yellow"
      },
      variants: [
        { id: "gid://shopify/ProductVariant/2001", title: "S", price: { amount: 49.99, currencyCode: "USD" } },
        { id: "gid://shopify/ProductVariant/2002", title: "M", price: { amount: 49.99, currencyCode: "USD" } }
      ],
      metafields: {
        custom: {
          related_products: [
            { id: "gid://shopify/Product/1002", handle: "sunny-hat-yellow", title: "Sunny Hat - Yellow" }
          ]
        }
      }
    },
    {
      id: "gid://shopify/Product/1002",
      handle: "sunny-hat-yellow",
      title: "G string",
      description: "Stylish hat for sunny days.",
      featured_image: {
        url: "https://cdn.shopify.com/s/files/1/1234/5678/products/sunny-hat.jpg",
        altText: "Sunny Hat Yellow"
      },
      variants: [
        { id: "gid://shopify/ProductVariant/2003", title: "One Size", price: { amount: 19.99, currencyCode: "USD" } }
      ]
    }
  ]
};


export const demoCollections = [
  {
    handle: "summer-2026",
    title: "Summer 2026 Collection",
    description: "A fresh selection of summer wear for 2026.",
    products: [
      { id: "gid://shopify/Product/1001", handle: "cameira-floral-sleepwear-robe-dusty-blue", title: "Massive Dildo", variants: [{ "id": "gid://shopify/ProductVariant/47964600238312", "title": "XS", "price": { "amount": "419000.0", "currencyCode": "IDR" }, "selectedOptions": [ { "name": "Size", "value": "XS" } ], "sku": null }, { "id": "gid://shopify/ProductVariant/47964600271080", "title": "S", "price": { "amount": "419000.0", "currencyCode": "IDR" }, "selectedOptions": [ { "name": "Size", "value": "S" } ], "sku": null }] },
      { id: "gid://shopify/Product/1002", handle: "milky-lace-suspender-skirt-black", title: "Mily Lace Condom", variants: [{ "id": "gid://shopify/ProductVariant/47964716335336", "title": "XS", "price": { "amount": "189000.0", "currencyCode": "IDR" }, "selectedOptions": [ { "name": "Size", "value": "XS" } ], "sku": null }, { "id": "gid://shopify/ProductVariant/47964716368104", "title": "S", "price": { "amount": "189000.0", "currencyCode": "IDR" }, "selectedOptions": [ { "name": "Size", "value": "S" } ], "sku": null }, { "id": "gid://shopify/ProductVariant/47964716400872", "title": "M", "price": { "amount": "189000.0", "currencyCode": "IDR" }, "selectedOptions": [ { "name": "Size", "value": "M" } ], "sku": null }, { "id": "gid://shopify/ProductVariant/47964716433640", "title": "L", "price": { "amount": "189000.0", "currencyCode": "IDR" }, "selectedOptions": [ { "name": "Size", "value": "L" } ], "sku": null }, { "id": "gid://shopify/ProductVariant/47964716466408", "title": "XL", "price": { "amount": "189000.0", "currencyCode": "IDR" }, "selectedOptions": [ { "name": "Size", "value": "XL" } ], "sku": null }, { "id": "gid://shopify/ProductVariant/47964716499176", "title": "XXL", "price": { "amount": "189000.0", "currencyCode": "IDR" }, "selectedOptions": [ { "name": "Size", "value": "XXL" } ], "sku": null }] }
    ]
  },
  {
    handle: "autumn-2026",
    title: "Autumn 2026 Collection",
    description: "Cozy pieces for fall 2026.",
    products: [
      { id: "gid://shopify/Product/1003", handle: "cozy-sweater-red", title: "Cozy Sweater - Red", variants: [{ id: "2004", title: "M", price: { amount: 69.99 } }] },
      { id: "gid://shopify/Product/1004", handle: "leafy-scarf-green", title: "Leafy Scarf - Green", variants: [{ id: "2005", title: "One Size", price: { amount: 29.99 } }] }
    ]
  }
];


function extractAllProductHandles(templateObject) {
  const handles = new Set()

  templateObject.children.forEach(el => {
    const h = el.props?.product_handle
    if (h) handles.add(h)
  })
  

  return [...handles]
}

function extractAllCollectionHandles(templateObject) {
  const handles = new Map();

  templateObject.children.forEach(el => {
    const handle = el.props?.collection_handle;
    if (!handle) return;
    handles.set(handle, {
      handle,
      initial_number_of_products: el.props?.initial_number_of_products,
      paginate_by: el.props?.paginate_by,
    });
  });

  return [...handles.values()];
}

const matchProductHandleToProductTemplate = (db, productHandle) => {
  console.log('db', db)
  const productTemplate =
    db.product_templates.custom_product_map[productHandle] ||
    db.product_templates.default_template ||  "minimal"; // final fallback

  return db.product_templates.templates[productTemplate] ||
    db.product_templates.templates[db.store.product_templates.default_template];

}
