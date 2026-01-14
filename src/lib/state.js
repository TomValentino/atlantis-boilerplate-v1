'use client'
import { useSyncExternalStore } from "react";

export const createCustomState = (initialState, customMethods = {}) => {
  const state = { ...initialState };
  const subscribers = {};

  // --- init top-level subscribers ---
  Object.keys(initialState).forEach((key) => {
    subscribers[key] = new Set();
  });

  const notify = (key) => {
    subscribers[key]?.forEach((cb) => cb());
  };

  const get = (key) => state[key];

  const set = (key, val) => {
    state[key] = val;
    notify(key);

    // auto-notify nested subscribers if updating an object
    if (typeof val === "object" && val !== null) {
      Object.keys(val).forEach((subKey) => {
        notify(`${key}:${subKey}`);
      });
    }
  };

  const subscribe = (key, cb) => {
    subscribers[key] ??= new Set();
    subscribers[key].add(cb);
    return () => subscribers[key].delete(cb);
  };

  // --- Nested / subkey support ---
  const subscribeKey = (baseKey, subKey, cb) => {
    const key = `${baseKey}:${subKey}`;
    subscribers[key] ??= new Set();
    subscribers[key].add(cb);

    // initialize object if missing
    if (!state[baseKey]) state[baseKey] = {};
    return () => subscribers[key].delete(cb);
  };

  const setKey = (baseKey, subKey, value) => {
    state[baseKey] ??= {};
    state[baseKey][subKey] = value;
    notify(`${baseKey}:${subKey}`);
  };

  const useKey = (baseKey, subKey) =>
    useSyncExternalStore(
      (cb) => subscribeKey(baseKey, subKey, cb),
      () => state[baseKey]?.[subKey],
      () => state[baseKey]?.[subKey]
    );

  // --- top-level hook ---
  const use = (key) =>
    useSyncExternalStore(
      (cb) => subscribe(key, cb),
      () => get(key),
      () => get(key)
    );

  // --- custom methods binding ---
  const boundMethods = {};
  Object.keys(customMethods).forEach((name) => {
    boundMethods[name] = (...args) =>
      customMethods[name]({ get, set, setKey }, ...args);
  });

  return {
    get,
    set,
    use,
    useKey,
    setKey,
    ...boundMethods,
  };
};

// --- Example MVP store ---
export const pageState = createCustomState(
  {
    page_type: null,
    product: null,
    products: {}, // changed to object so individual product ids are reactive
  },
  {
   setupPageState: ({ set, setKey }, type, product, products) => {
  set("page_type", type);
  set("product", product);
console.log('products', products)
  if (Array.isArray(products)) {
    products.forEach((p) => {
      if (!p?.handle) {
        console.warn("Product missing handle:", p);
        return;
      }
      setKey("products", p.handle, p);
    });
  }
},

  }
);


export const variantSelectorState = createCustomState(
  {
    selectors: {},
  },
  {
    init: ({ get, set }, id, firstVariant) => {
      const selectors = get("selectors")
      if (selectors[id]) return

      set("selectors", {
        ...selectors,
        [id]: {
          qty: 1,
          selectedVariantId: firstVariant.id,
        },
      })
    },

    setVariant: ({ get, set }, id, variantId) => {
      const selectors = get("selectors")
      set("selectors", {
        ...selectors,
        [id]: {
          ...selectors[id],
          selectedVariantId: variantId,
        },
      })
    },

    setQty: ({ get, set }, id, qty) => {
      const selectors = get("selectors")
      set("selectors", {
        ...selectors,
        [id]: {
          ...selectors[id],
          qty,
        },
      })
    },
  }
)





export const productsState = createCustomState(
  {
    default_product: {},   // main product (single)
    extra_products: {},    // keyed by handle
  },
  {
    setProducts: ({ set, setKey }, defaultProduct, productsArray) => {
      // set default product
      if (defaultProduct?.handle) {
        set("default_product", defaultProduct)
      } else {
        console.warn("setProducts → default product missing handle", defaultProduct)
      }

      // set all extra products
      if (Array.isArray(productsArray)) {
        productsArray.forEach((p) => {
          if (!p?.handle) {
            console.warn("setProducts → product missing handle:", p)
            return
          }
          setKey("extra_products", p.handle, p)
        })
      }
    },
  }
)





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






export const overlayState = createCustomState(
  {
    overlays: {}, // { [id]: { visible: boolean } }
  },
  {
    show: ({ get, set }, id) => {
      set('overlays', {
        ...get('overlays'),
        [id]: { visible: true },
      })
    },

    hide: ({ get, set }, id) => {
      const overlays = get('overlays')
      if (!overlays[id]) return

      set('overlays', {
        ...overlays,
        [id]: { visible: false },
      })
    },

    toggle: ({ get, set }, id) => {
      const overlays = get('overlays')
      console.log('toggleling')
      set('overlays', {
        ...overlays,
        [id]: { visible: !overlays[id]?.visible },
      })
    },

    hideAll: ({ set }) => {
      set('overlays', {})
    },
  }
)


export const cartState = createCustomState(
  {
    hasOpened: false,
    show: false,
    isAdding: false,
    products: [],
    total: 0,
    count: 0, // number of products in cart
  },
  {
    showCart: ({ get, set }) => {
      if (!get('hasOpened')) set('hasOpened', true)
      set('show', true)
    },

    hideCart: ({ set }) => set('show', false),

    toggleCart: ({ get, set }) => {
      const next = !get('show')
      if (next && !get('hasOpened')) set('hasOpened', true)
      set('show', next)
    },

    setProducts: ({ set }, products) => {
      set('products', products)
      set(
        'total',
        products.reduce((sum, p) => sum + p.price * (p.quantity || 1), 0)
      )
      set(
        'count',
        products.reduce((sum, p) => sum + (p.quantity || 1), 0)
      )
    },

    updateQty: ({ get, set }, variantId, newQty) => {
      const items = get('products').map(item =>
        item.variantId === variantId
          ? { ...item, qty: newQty }
          : item
      )

      set('products', items)
      set('count', items.reduce((s, p) => s + p.qty, 0))
      set('total', items.reduce((s, p) => s + p.price * p.qty, 0))
    },



    addProduct: ({ get, set }, item) => {
      const variantId = item.variantId;
      const qty = item.qty || 1;

      const existing = get('products').find(p => p.variantId === variantId);

      let newProducts;

      if (existing) {
        newProducts = get('products').map(p =>
          p.variantId === variantId
            ? { ...p, qty: p.qty + qty }
            : p
        );
      } else {
        newProducts = [
          ...get('products'),
          {
            id: variantId,
            variantId,
            productId: item.productId,
            title: item.title,
            price: item.price,
            qty,
          },
        ];
      }

      set('products', newProducts);
      set('total', newProducts.reduce((s, p) => s + p.price * p.qty, 0));
      set('count', newProducts.reduce((s, p) => s + p.qty, 0));
      if (!get('hasOpened')) set('hasOpened', true)
      set('show', true)
    },

    removeProduct: ({ get, set }, id) => {
      const newProducts = get('products').filter(p => p.id !== id)
      set('products', newProducts)
      set(
        'total',
        newProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
      )
      set(
        'count',
        newProducts.reduce((sum, p) => sum + p.quantity, 0)
      )
    },

    clearCart: ({ set }) => {
      set('products', [])
      set('total', 0)
      set('count', 0)
      set('show', false)
    },
  }
)










// Idk why myust be @ bottom
export const useOverlay = (id) => {
  const overlays = overlayState.use('overlays')
  return overlays[id] ?? { visible: false }
}


export const useVariantSelector = (id) => {
  const selectors = variantSelectorState.use("selectors")
  return selectors[id]
}

export const useProduct = (handle = null) => {
  const defaultProduct = productsState.use("default_product");
  const extraProducts = productsState.use("extra_products");

  if (!handle) return defaultProduct;

  return extraProducts?.[handle] || null;
};


// Hook for components
export const useCollection = (handle = null) => {
  const defaultCollection = collectionState.use("default_collection");
  const extraCollections = collectionState.use("extra_collections");

  if (!handle) return defaultCollection;

  return extraCollections?.[handle] || null;
};