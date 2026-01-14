
import React from "react";
import { CartItem, CartItemQty, CartPrice, CartProducts, CartTitle } from "@/components/cart";
import { AddToCartButton, CollectionProducts, ProductTitle, ProductWrapper, VariantSelector } from "@/components/products";




function CollectionCard({ collection, children, no_collection_children }) {
  if (!collection) {
    console.warn("⚠️ NO PRODUCT!");
    return <>{no_collection_children}</>; // fallback children when product is missing
  }

  return (
    <div style={{ border: "1px solid #eee", padding: "1rem", marginBottom: "1rem" }}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child, { collection }) : child
      )}
    </div>
  );
}



// 🛠️ --- Component Registry ---
const componentRegistry = {
    collection_card: {
        Component: CollectionCard, needsCollection: true,
    },
    collection_form: {
        Component: CollectionProducts, needsCollection: true, needsProduct: true,
    },
    
    metafield_block: {
        needsProduct: true,
        Component: ({ product, namespace, key }) => {
            return <p>{product.metafields?.[namespace]?.[key]?.value}</p>;
        }
    },
    related_products: {
        needsProduct: true,
        Component: ({ product }) => {
            const related = product.metafields?.custom?.related_products;
            return related?.map(p => <ProductCard key={p.id} product={p} />);
        }
    }
    ,
    product_wrapper: { 
        Component: ProductWrapper, needsProduct: true 
    },
    product_title: {
        Component: ProductTitle,
        needsProduct: true,
    },

    product_price: {
        Component: ({ product }) => <p>${product?.price?.min || "N/A"}</p>,
        needsProduct: true,
    },
    variant_selector_01: {
        Component: ({ product }) =>
            product?.variants?.map((v) => (
                <div key={v.id}>
                    {v.title} - ${v.price.amount}
                </div>
            )),
        needsProduct: true,
    },
    variant_selector: {
        Component: VariantSelector,
        needsProduct: true,
    },
    title: {
        Component: ({ text }) => <h1>{text}</h1> 
    },
    button: { 
        Component: ({ text }) => <button>{text}</button> 
    },
    add_to_cart_button: { 
        Component: AddToCartButton,
        needsProduct: true,
    },
      
    cart_products: { 
        Component: CartProducts, 
    },
    cart_item: {
        Component: CartItem,
    },
    cart_item_qty: {
        Component: CartItemQty,
    },
    cart_title: {
        Component: CartTitle,
    },
    cart_price: {
        Component: CartPrice,
    },
};



// 🔄 --- Central Render Function ---
export const renderElement = (element, ctx = {}) => {
    if (!element) return null;

    // Find the component
    const registryEntry = componentRegistry[element.component];
    if (!registryEntry) {
        console.warn(`⚠️ Component not registered: ${element.component}`);
        return null;
    }
    const { Component, needsProduct, needsCollection } = registryEntry;

    // Props from builder
    const props = {
        ...element.props,
        className: Array.isArray(element.props?.className)
            ? element.props.className.join(" ")
            : element.props?.className,
    };

    // --- LOCAL CONTEXT (overridable!)
    let product = ctx.product;
    let collection = ctx.collection;

    // --- OPTIONAL OVERRIDES FROM ELEMENT PROPS ---
    if (element.props?.product) {
        product = element.props.product;
    }

    if (element.props?.collection) {
        collection = element.props.collection;
    }

    // --- Pass inital context (based on page type) - * CAN be overwridden for extra products/pages * ---
    if (needsProduct && product) props.product = product;
    if (needsCollection && collection) props.collection = collection;

    // --- Special children blocks ---
    if (element.component === "product_wrapper") {
        props.no_product_children = (element.props?.no_product_children || []).map((child) =>
            renderElement(child, { product, collection })
        );
    }

    if (element.component === "collection_form") {
        props.no_collection_children = (element.props?.no_collection_children || []).map((child) =>
            renderElement(child, { product, collection })
        );
    }

    if (element.component === "cart_products") {
        props.empty_cart_children = (element.props?.empty_cart_children || []).map((child) =>
            renderElement(child, { product, collection })
        );
    }

    // --- Render normal children ---
    const renderedChildren = (element.children || []).map((child) =>
        renderElement(child, { product, collection })
    );

    return (
        <Component key={element.element_id} {...props}>
            {renderedChildren}
        </Component>
    );
};
