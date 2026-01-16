import { getCachedDB } from "@/lib/cached-db"
import {  getCollectionsByHandles, getProductByHandle, getProductsByHandles } from "@/lib/shopify-queries"
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
  console.log('product handles', handles, product_template)
  console.log("%cHere is my product:", "color: gold; font-weight: bold;", product, handles);
  console.log("%cHere is my products:", "color: gold; font-weight: bold;", products);

  // Collections state is changeable - must be custom
  const collection_handles = extractAllCollectionHandles(product_template)
  
  const all_collections = await getCollectionsByHandles(collection_handles, 5)
  console.log('all collections,', all_collections)


  return (
    <>
      <SetupCollectionState collection={null} collections={all_collections}/>
      <SetupProductState product={product} products={products} />
      <SetupOverlays overlays={db.overlays} product={product} products={products} />

      {/* {
        product_template.children.map(item => {
          return renderElement(item, { product });
        })
      } */}
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
