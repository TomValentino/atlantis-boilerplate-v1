"use client";
import { useState, useLayoutEffect } from "react";

export default function ClientPage({ initialProducts }) {
  // Match server on first render → no hydration mismatch
  const [products, setProducts] = useState(initialProducts);

  // After hydration, instantly replace with history
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("history_products");
      if (saved) {
        setProducts(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const addMoreProducts = (newProducts) => {
    const updated = [...products, ...newProducts];
    setProducts(updated);
    localStorage.setItem("history_products", JSON.stringify(updated));
  };

  return (
    <div>
      <pre>{JSON.stringify(products, null, 2)}</pre>
      <button onClick={() => addMoreProducts([{ id: Math.random(), title: "New" }])}>
        Add More
      </button>
    </div>
  );
}
