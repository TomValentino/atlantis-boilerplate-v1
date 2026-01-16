'use client'

import { cartState, pageState, productsState, useCollection, useProduct, useVariantSelector, variantSelectorState } from "@/lib/state";
import React, { useRef, useState } from "react";

// --- ProductTitle ---
export const ProductTitle = ({ product }) => {
  if (!product) {
    console.error("ProductTitle: No product passed!");
    return <h3>No product</h3>;
  }
  return <h3>{product.title || "No product"}</h3>;
};

// --- ProductPrice ---
export const ProductPrice = ({ product }) => {
  if (!product) {
    console.error("ProductPrice: No product passed!");
    return <h3>N/A</h3>;
  }
  // console.log('product', product)
  return <h3>{product.price ?? "N/A"}</h3>;
};

// --- ProductWrapper ---
export const ProductWrapper = ({ product_handle, children, no_product_children }) => {
  const product = useProduct(product_handle);

  if (!product) {
    console.warn("ProductWrapper: No product found for handle", product_handle);
    return <>{no_product_children}</>; // fallback children
  }

  return (
    <>
      {product.title}
      {React.Children.map(children, child =>
        React.isValidElement(child) ? React.cloneElement(child, { product }) : child
      )}
    </>
  );
};

// --- VariantSelector ---
export const VariantSelector = ({ product }) => {
  if (!product) {
    console.error("VariantSelector: No product passed!");
    return null;
  }

  const didInit = useRef(false);
  const [open, setOpen] = useState(false);

  if (!didInit.current && product?.variants?.[0]) {
    didInit.current = true;
    variantSelectorState.init(product.handle, product.variants[0]);
  }

  const selector = useVariantSelector(product.handle);
  if (!selector) return null;

  const selectedVariant = product.variants.find(
    (v) => v.id === selector.selectedVariantId
  );

  if (!selectedVariant) return null;

  const darkBg = "#1e1e1e";
  const darkBorder = "#333";
  const darkText = "#eee";
  const highlight = "#555";

  return (
    <div style={{ marginBottom: 20, position: "relative", color: darkText }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: "1px solid " + darkBorder,
          padding: "8px 12px",
          cursor: "pointer",
          userSelect: "none",
          background: darkBg,
          borderRadius: 6,
        }}
      >
        {selectedVariant.title || "Select variant"}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            border: "1px solid " + darkBorder,
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

      <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
        <button
          onClick={() =>
            variantSelectorState.setQty(
              product.handle,
              Math.max(1, selector.qty - 1)
            )
          }
          style={{
            background: darkBg,
            border: "1px solid " + darkBorder,
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
            border: "1px solid " + darkBorder,
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

// --- AddToCartButton ---
export function AddToCartButton({ product }) {
  if (!product) {
    console.error("AddToCartButton: No product passed!");
    return null;
  }
  const selector = useVariantSelector(product.handle);
  const selectedVariantId = selector?.selectedVariantId || product?.variants?.[0]?.id;
  const variant = product.variants.find(v => v.id === selectedVariantId);

  if (!variant) {
    console.error("AddToCartButton: No variant found for product", product);
    return null;
  }

  const handleAdd = () => { cartState.addCartItem(product, variant, selector?.qty || 1, )  };

  return <button onClick={handleAdd}>Add to Cart</button>;
}

// --- CollectionProducts ---
export const CollectionProducts = ({ collection_handle, children, no_collection_children, wrapperClassName }) => {
  const collection = useCollection(collection_handle);
  // console.log('COLLECTION', collection)

  if (!collection) {
    console.warn("CollectionProducts: No collection found for handle", collection_handle);
    return <>{no_collection_children}</>;
  }

  const collectionProducts = collection.products || [];
  if (!collectionProducts.length) return <>{no_collection_children}</>;

  return (
    <div className={wrapperClassName}>
      {collectionProducts.map(product => (
        <React.Fragment key={product.id}>
          {React.Children.map(children, child =>
            React.isValidElement(child) ? React.cloneElement(child, { product }) : child
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
