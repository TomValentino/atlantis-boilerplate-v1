'use client'

import { createCustomState } from "@/lib/state";


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




// Hook for components
export const useCollection = (handle = null) => {
  const defaultCollection = collectionState.use("default_collection");
  const extraCollections = collectionState.use("extra_collections");

  if (!handle) return defaultCollection;

  return extraCollections?.[handle] || null;
};