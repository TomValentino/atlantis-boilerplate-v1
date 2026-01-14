'use client'

import { cartState, pageState, productsState, useCollection, useProduct, useVariantSelector, variantSelectorState } from "@/lib/state";
import React, { useRef, useState } from "react";


export const ProductTitle = ({product}) => {
  return (
     <h3>{product?.title || "no product"}</h3>
  )
}


export const ProductWrapper = ({ product_handle, children, no_product_children} ) => {

  const product = useProduct(product_handle)
  console.log("%cHere is my product:", "color: light-green; font-weight: bold;", product);

  if (!product){
    console.warn('NO PRODUCT');
    return <>{no_product_children}</>; // fallback children when product is missing

  }

  return (
    <>
    {product.title}
    { React.Children.map(children, child =>  React.isValidElement(child) ? React.cloneElement(child, { product })  : child) }
    
    </>
  )
}

export const VariantSelector = ({ product }) => {
  const didInit = useRef(false);

  if (!didInit.current) {
    didInit.current = true;
    variantSelectorState.init(product.handle, product.variants[0]);
  }

  const selector = useVariantSelector(product.handle);
  if (!selector) return null;

  const [open, setOpen] = useState(false);

  const selectedVariant = product.variants.find(
    (v) => v.id === selector.selectedVariantId
  );

  const darkBg = "#1e1e1e";
  const darkBorder = "#333";
  const darkHover = "#333";
  const darkText = "#eee";
  const highlight = "#555";

  return (
    <div style={{ marginBottom: 20, position: "relative", color: darkText }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: `1px solid ${darkBorder}`,
          padding: "8px 12px",
          cursor: "pointer",
          userSelect: "none",
          background: darkBg,
          borderRadius: 6,
        }}
      >
        {selectedVariant?.title || "Select variant"}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            border: `1px solid ${darkBorder}`,
            background: darkBg,
            zIndex: 10,
            borderRadius: 6,
            overflow: "hidden",
            marginTop: 2,
          }}
        >
          {product.variants.map((v) => (
            <div
              key={v.id}
              onClick={() => {
                variantSelectorState.setVariant(product.handle, v.id);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                background: v.id === selector.selectedVariantId ? highlight : darkBg,
                color: darkText,
              }}
            >
              {v.title}
            </div>
          ))}
        </div>
      )}

      {/* Qty buttons */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() =>
            variantSelectorState.setQty(
              product.handle,
              Math.max(1, selector.qty - 1)
            )
          }
          style={{
            background: darkBg,
            border: `1px solid ${darkBorder}`,
            borderRadius: 4,
            padding: "4px 10px",
            color: darkText,
            cursor: "pointer",
          }}
        >
          -
        </button>

        <span>{selector.qty}</span>

        <button
          onClick={() =>
            variantSelectorState.setQty(product.handle, selector.qty + 1)
          }
          style={{
            background: darkBg,
            border: `1px solid ${darkBorder}`,
            borderRadius: 4,
            padding: "4px 10px",
            color: darkText,
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};


export function AddToCartButton({ product }) {
  const selector = useVariantSelector(product.handle);

  if (!selector) return console.warn('NO SELECTOR')

  const handleAdd = () => {
    const variantId = selector.selectedVariantId;
    const variant = product.variants.find(v => v.id === variantId);

    cartState.addProduct({
      productId: product.id,
      variantId: variant.id,
      title: `${product.title} - ${variant.title}`,
      handle: product.handle,
      image: product.featured_image,
      variant_title: variant.title,
      price: variant.price,
      compare_at_price: '',
      qty: selector.qty,
    });
  };

  return <button onClick={handleAdd}>Add to Cart</button>;
}




export const CollectionProducts = ({ 
  collection_handle, 
  children, 
  no_collection_children, 
  wrapperClassName 
}) => {

  const collection = useCollection(collection_handle);
  console.log('colly', collection)
  if (!collection) return <>{no_collection_children}</>

  const collectionProducts = collection.products || [];
  console.log("!???",collectionProducts)

  if (!collectionProducts.length) return empty_collection_children;

  return (
    <div className={wrapperClassName}>
      {collectionProducts.map(product => 
        React.Children.map(children, child => 
          React.isValidElement(child) ? React.cloneElement(child, { product }) : child
        )
      )}
    </div>
  )
} 