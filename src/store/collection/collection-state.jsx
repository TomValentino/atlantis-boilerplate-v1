'use client'

import { createCustomState } from "@/lib/state";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

export const collectionState = createCustomState(
  {
    collections: {},  // keyed by id
  },
  {
    setCollections: ({ set, setKey }, collectionsArray = []) => {
      if (!Array.isArray(collectionsArray)) return;

      collectionsArray.forEach((c) => {
        if (!c?.id) {
          console.warn("setCollections → collection missing id:", c);
          return;
        }
        console.log(c, c.id)
        setKey("collections", c.id, c);
      });

    },

    setCollection: ({ set, setKey }, collection) => {
      if (!collection?.id) {
        console.warn("setCollection → missing id:", collection);
        return;
      }
      setKey("collections", collection.id, collection);
    },

    getCollection: ({ get }, id) => {
      const collections = get("collections");
      return collections?.[id] || null;
    },
  }
);

// Hook to access a collection by id
export const useCollection = (id) => {
  const collections = collectionState.use("collections");
  console.log('ALL COLLECTIONS', collections, id)
  return collections?.[id] || null;
};




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







