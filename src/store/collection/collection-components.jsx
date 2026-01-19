
'use client'
import React, { useEffect, useRef } from "react";
import { collectionPageState, collectionState, useCollection } from "./collection-state";


export function SetupExtraCollectionsState({ collections = [] }) {
  const didInit = useRef(false);

  if (!didInit.current) {
    didInit.current = true;


    collectionState.setCollections(collections);
  }

  return null;
}

export const SetupCollectionPage = ({ collection, children }) => {
  const restoredScroll = useRef(false);

  useEffect(() => {
    let initial = collection;

    if (typeof window !== "undefined") {
      const fromHistory = history.state?.products;
      if (fromHistory) initial = { ...collection, products: fromHistory };
      try {
        initial = JSON.parse(fromStorage);
      } catch (_) {}
    }

    collectionPageState.setCollection(initial);
    collectionPageState.setIsLoading(false);
  }, [collection]);

  // Restore scroll after first products render
  const products = collectionPageState.use("collection").products;
  useEffect(() => {
    if (restoredScroll.current) return;
    if (history.state?.scrollY != null) {
      window.scrollTo(0, history.state.scrollY);
      restoredScroll.current = true;
    }
  }, [products]);

  // Track scroll for back/forward
  useEffect(() => {
    const handleScroll = () => {
      history.replaceState(
        { ...history.state, scrollY: window.scrollY },
        document.title
      );
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <>{children}</>;
};



// --- CollectionProducts ---
export const CollectionProducts = ({ collection_id, children, no_collection_children, wrapperClassName }) => {
  const collection = useCollection(collection_id);
  // console.log('COLLECTION', collection)

  if (!collection) {
    console.warn("CollectionProducts: No collection found for handle", collection_id);
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
