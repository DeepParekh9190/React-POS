import { createContext, useContext, useState, useCallback, useEffect } from "react";

const OrderContext = createContext(null);
const STORAGE_KEY = "novapos_orders";

function loadOrders() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const markPaid = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, duePaid: true, duePaidAt: Date.now() } : o
      )
    );
  }, []);

  const updateOrder = useCallback((orderId, updates) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  }, []);

  const clearHistory = useCallback(() => {
    setOrders([]);
  }, []);

  return (
    <OrderContext.Provider value={{ orders, addOrder, markPaid, updateOrder, clearHistory }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
