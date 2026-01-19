'use client'

import { createCustomState } from "@/lib/state";
import { useEffect } from "react";


export const collectionState = createCustomState(
  {
    default_collection: {},  // main collection
    extra_collections: {},   // keyed by handle
  },
  {
    setCollections: ({ set, setKey }, defaultCollection, collectionsArray = []) => {
      // Set default collection
      if (defaultCollection?.handle) {
        set("default_collection", defaultCollection);
      } else {
        console.warn("setCollections → default collection missing handle", defaultCollection);
      }

      // Set extra collections
      if (Array.isArray(collectionsArray)) {
        collectionsArray.forEach((c) => {
          if (!c?.handle) {
            console.warn("setCollections → collection missing handle:", c);
            return;
          }
          setKey("extra_collections", c.handle, c);
        });
      }
    },
  }
);

 export const collectionPageState = createCustomState(
  {
    collection: {},  // main collection
  },
  {
    setCollection: ({ set, setKey }, collection) => {
      set("collection", collection);
    },
  }
);



export const SetupCollectionPageState = ({ collection, children }) => {
  
  useEffect(() => {
    if (!collection?.id) {
      collectionPageState.setCollection(collection);
      return;
    }

    // Try to load previous state for this collection
    const saved = localStorage.getItem(`collection-state-${collection.id}`);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Hydrate the state store with the saved version
        collectionPageState.setCollection(parsed);
        return;
      } catch (e) {
        console.warn("Failed to parse saved collection state", e);
      }
    }

    // No saved state → use fresh one
    collectionPageState.setCollection(collection);

  }, [collection]);

  return <>{children}</>;
};


// Hook for components
export const useCollection = (handle = null) => {
  const defaultCollection = collectionState.use("default_collection");
  const extraCollections = collectionState.use("extra_collections");

  if (!handle) return defaultCollection;

  return extraCollections?.[handle] || null;
};