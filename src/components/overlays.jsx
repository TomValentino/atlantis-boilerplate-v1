'use client'
import { renderElement } from '@/lib/render';
import { cartState, collectionState, productsState, useOverlay } from '@/lib/state';

// ---------- shells & overlays FIRST ----------

export const OverlayShell = ({ show, hasOpened, className, zIndex, children }) => (
  <div className={`${className} ${show ? 'show' : 'hide'}`} style={{zIndex}}>
    {hasOpened ? children : null}
  </div>
)

export const SliderCartOverlay = ({ children, z_index = 100 }) => {
  const show = cartState.use('show')
  const hasOpened = cartState.use('hasOpened')

  return (
    <OverlayShell show={show} hasOpened={hasOpened} className="slider-cart" zIndex={z_index}>
      {children}
    </OverlayShell>
  )
}


export const StandardOverlay = ({ overlay_id }) => {
  const { visible } = useOverlay(overlay_id)
  if (!visible) return null
  return <div>STANDARD</div>
}

// ---------- template registry AFTER ----------

export const overlayTemplates = {
  slider_cart_overlay: SliderCartOverlay,
  standard_overlay: StandardOverlay,
}

// ---------- setup renderer ----------

export function SetupOverlays({ overlays, product = null, products = [] }) {
  return overlays.map((overlay) => {
    const Template = overlayTemplates[overlay.component]
    if (!Template) return null

    return (
      <Template key={overlay.overlay_id} overlayId={overlay.overlay_id} {...overlay.props}>
        {overlay.children?.map((el) =>
          renderElement(el, product, products)
        )}
      </Template>
    )
  })
}
// ---------- setup renderer ----------

export function SetupProductState({  product = null, products = [] }) {
  
  console.log('product', product)
  console.log('products', products)
  productsState.setProducts(product, products)

  return null
  
}

export function SetupCollectionState({  collection = null, collections = [] }) {
  
  collectionState.setCollections(collection, collections)

  return null
  
}