'use client'

import { createCustomState } from "@/lib/state";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";


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
    isLoading: true,
  },
  {
    setCollection: ({ set, setKey }, collection) => {
      set("collection", collection);
    },
    setIsLoading: ({ set, setKey }, value) => {
      set("isLoading", value);
    },
  }
);




export const SetupCollectionPageState = ({ collection, children }) => {

    // const didInit = useRef(false);
    // if (!didInit.current) {
      // didInit.current = true;

      useEffect(() => {

        let initial = collection;
    
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(`collection-state-${collection.handle}`);
    
          if (saved) {
            try {
              initial = JSON.parse(saved);
              console.log('initail', initial)
            } catch (_) {}
          }
        }
          // Hydrate instantly before paint
          collectionPageState.setCollection(initial);
          collectionPageState.setIsLoading(false);
          
        
      }, [])

  
    // }



  return <>{children}</>;
};

// Hook for components
export const useCollection = (handle = null) => {
  const defaultCollection = collectionState.use("default_collection");
  const extraCollections = collectionState.use("extra_collections");

  if (!handle) return defaultCollection;

  return extraCollections?.[handle] || null;
};