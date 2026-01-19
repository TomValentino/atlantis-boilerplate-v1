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

  const setSilent = (key, val) => {
    state[key] = val;
    // no notify
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
      customMethods[name]({ get, set, setKey, setSilent, notify }, ...args);
  });

  return {
    get,
    set,
    use,
    useKey,
    setKey,
    setSilent,
    notify,
    ...boundMethods,
  };
};









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

// Idk why myust be @ bottom
export const useOverlay = (id) => {
  const overlays = overlayState.use('overlays')
  return overlays[id] ?? { visible: false }
}


