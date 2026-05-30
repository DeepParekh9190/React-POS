import { createContext, useContext, useState, useCallback, useEffect } from "react";

const CustomerContext = createContext(null);
const STORAGE_KEY = "novapos_customers";
const POINTS_PER_RUPEE = 0.01;

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState(load);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  const addOrUpdateCustomer = useCallback(({ name, phone, orderTotal }) => {
    if (!phone && !name) return null;
    let customer = customers.find((c) => phone && c.phone === phone);
    if (customer) {
      const updated = {
        ...customer,
        name: name || customer.name,
        totalSpent: (customer.totalSpent || 0) + (orderTotal || 0),
        visitCount: (customer.visitCount || 0) + 1,
        lastVisit: Date.now(),
        loyaltyPoints: (customer.loyaltyPoints || 0) + Math.floor((orderTotal || 0) * POINTS_PER_RUPEE),
      };
      setCustomers((prev) => prev.map((c) => c.id === customer.id ? updated : c));
      return updated;
    }
    const created = {
      id: Date.now().toString(36).toUpperCase(),
      name: name || "Unknown",
      phone: phone || "",
      totalSpent: orderTotal || 0,
      visitCount: 1,
      lastVisit: Date.now(),
      loyaltyPoints: Math.floor((orderTotal || 0) * POINTS_PER_RUPEE),
      createdAt: Date.now(),
    };
    setCustomers((prev) => [...prev, created]);
    return created;
  }, [customers]);

  const earnPoints = useCallback((customerId, amount) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, totalSpent: (c.totalSpent || 0) + amount, loyaltyPoints: (c.loyaltyPoints || 0) + Math.floor(amount * POINTS_PER_RUPEE) }
          : c
      )
    );
  }, []);

  const redeemPoints = useCallback((customerId, points) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) - points) } : c
      )
    );
  }, []);

  const updateCustomer = useCallback((id, updates) => {
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
  }, []);

  return (
    <CustomerContext.Provider value={{ customers, selectedCustomer, setSelectedCustomer, addOrUpdateCustomer, earnPoints, redeemPoints, updateCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomers must be used within CustomerProvider");
  return ctx;
}
