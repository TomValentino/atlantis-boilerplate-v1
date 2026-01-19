import { getCachedDB } from "@/lib/cached-db"
import Link from "next/link"
import { renderElement } from "@/lib/render"
import { getProductByHandle, getProductsByHandles } from "@/store/products/products-server"
import { SetupProductState } from "@/store/products/product-state"
import { SetupCollectionState } from "@/store/collection/collection-components"
import { fetchCollection, getCollectionsByHandles } from "@/store/collection/collection-server"


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

  // Prep data for fetches
  const db = await getCachedDB();
  const product_template = matchProductHandleToProductTemplate(db, productHandle)
  const handles = extractAllProductHandles(product_template);
  const collection_handles = extractAllCollectionHandles(product_template)

  // Fetches
  const products = await getProductsByHandles(handles);
  const all_collections = await getCollectionsByHandles(collection_handles, 5)
  console.log("%cHere is my product:", "color: gold; font-weight: bold;", product, handles);
  console.log('all collections,', all_collections)

  // Collection pagination
  // Load first page
  const page1 = await fetchCollection({
    handle: "valentines-sale",
    first: 5,
    filters: [
      {
        productMetafield: {
          namespace: "custom",
          key: "color",
          value: "Black"
        }
      }
    ]
  })

  // Load next page
  const page2 = await fetchCollection({
    handle: "valentines-sale",
    first: 5,
    filters: [
      {
        variantOption: {
          name: "Size",
          value: "XXL"
        }
      },
      { price: { min: 300000, max: 1000000 } },
    ],
     sortKey: "PRICE",
    reverse: true,
    after: page1.pageInfo.endCursor
  })

  console.log('page 1: ', page1)
  console.log('page 2: ', page2)


  return (
    <>
      <SetupCollectionState collection={null} collections={all_collections}/>
      <SetupProductState product={product} products={products} />

      { 
        db.overlays.map(overlay =>
          renderElement(overlay, product, products)
        )
      }

      {
        product_template.children.map(item => 
          renderElement(item, { product })
        )
      }

    </>
  )
}




// -------------------------
// Helpers
// -------------------------

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
