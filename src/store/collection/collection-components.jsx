
'use client'
import React, { useRef } from "react";
import { collectionState, useCollection } from "./collection-state";


export function SetupCollectionState({  collection = null, collections = [] }) {
  
    const didInit = useRef(false);
  
  if (!didInit.current) {
    didInit.current = true;
    collectionState.setCollections(collection, collections)
  }

  return null
  
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
