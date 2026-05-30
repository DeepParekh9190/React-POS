import { createContext, useContext, useState, useCallback, useEffect } from "react";
import defaultProducts from "../data/products";

const STORAGE_KEY = "novapos_products";

const ProductContext = createContext(null);

const lowStockThreshold = 5;

function enrich(products) {
  return products.map((p) => ({
    ...p,
    stock: p.stock ?? 999,
    hsn: p.hsn ?? "",
    cost_price: p.cost_price ?? 0,
  }));
}

function loadProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return enrich(parsed);
    }
  } catch {}
  return enrich(defaultProducts);
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(loadProducts);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      if (e.name === "QuotaExceededError" || e.code === 22) {
        alert("Storage full! Try smaller images or remove unused products.");
      }
    }
  }, [products]);

  const getProduct = useCallback((id) => {
    return products.find((p) => p.id === id) || null;
  }, [products]);

  const addProduct = useCallback((product) => {
    setProducts((prev) => {
      const maxId = prev.reduce((max, p) => Math.max(max, p.id), 0);
      return [...prev, { ...product, id: maxId + 1, stock: product.stock ?? 999, hsn: product.hsn ?? "", cost_price: product.cost_price ?? 0 }];
    });
  }, []);

  const duplicateProduct = useCallback((id) => {
    setProducts((prev) => {
      const original = prev.find((p) => p.id === id);
      if (!original) return prev;
      const maxId = prev.reduce((max, p) => Math.max(max, p.id), 0);
      return [...prev, { ...original, id: maxId + 1, name: original.name + " (copy)" }];
    });
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const decrementStock = useCallback((id, qty) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock - qty) } : p
      )
    );
  }, []);

  const incrementStock = useCallback((id, qty) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: (p.stock === undefined ? 999 : p.stock) + qty } : p
      )
    );
  }, []);

  const resetProducts = useCallback(() => {
    setProducts(enrich(defaultProducts));
  }, []);

  return (
    <ProductContext.Provider
      value={{ products, getProduct, addProduct, updateProduct, deleteProduct, duplicateProduct, decrementStock, incrementStock, resetProducts, lowStockThreshold }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
}
