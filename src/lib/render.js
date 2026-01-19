
import React from "react";
import { CartCount, CartItem, CartItemQty, CartPrice, CartProducts, CartTitle, CartTotal, CartVariantTitle, SliderCartOverlay } from "@/store/cart/cart-components";
import { AddToCartButton, ProductPrice, ProductTitle, ProductWrapper, VariantSelector } from "@/store/products/product-components";
import { CollectionProducts } from "@/store/collection/collection-components";


// 🛠️ --- Component Registry ---
const componentRegistry = {
    collection_form: {
        Component: CollectionProducts, needsCollection: true, needsProduct: true,
    },
    product_wrapper: { 
        Component: ProductWrapper, needsProduct: true 
    },
    product_title: {
        Component: ProductTitle,
        needsProduct: true,
    },
    product_price: {
        Component: ProductPrice,
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
    slider_cart_overlay: {
        Component: SliderCartOverlay
    },
    cart_products: { 
        Component: CartProducts, 
    },
    cart_total: { 
        Component: CartTotal, 
    },
    cart_count: { 
        Component: CartCount, 
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
    cart_variant_title: {
        Component: CartVariantTitle,
    },
    cart_title: {
        Component: CartTitle,
    },
    cart_price: {
        Component: CartPrice,
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
    if (element.props?.product) product = element.props.product;
    if (element.props?.collection) collection = element.props.collection;
    
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

    if (element.component === "slider_cart_overlay") {
        props.loading_children = (element.props?.loading_children || []).map((child) =>
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
