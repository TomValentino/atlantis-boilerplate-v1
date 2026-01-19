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
  const restoredScroll = useRef(false);

  // Hydrate collection once on first load
  useEffect(() => {
    let initial = collection;

    if (typeof window !== "undefined") {
      const fromHistory = history.state?.products;
      const fromStorage = localStorage.getItem(`collection-state-${collection.handle}`);

      if (fromHistory) {
        initial = { ...collection, products: fromHistory };
      } else if (fromStorage) {
        try {
          initial = JSON.parse(fromStorage);
        } catch (_) {}
      }
    }

    collectionPageState.setCollection(initial);
    collectionPageState.setIsLoading(false);
  }, [collection]);

  // Restore scroll after first products render
  const products = collectionPageState.use("collection")?.products || [];
  useEffect(() => {
    if (restoredScroll.current) return;
    if (!products.length) return;
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





// Hook for components
export const useCollection = (handle = null) => {
  const defaultCollection = collectionState.use("default_collection");
  const extraCollections = collectionState.use("extra_collections");

  if (!handle) return defaultCollection;

  return extraCollections?.[handle] || null;
};