import { useState, useEffect, useMemo } from "react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import "./Modal.css";

export default function QuickSellBar({ onClose }) {
  const { products } = useProducts();
  const { addItem } = useCart();
  const [assignments, setAssignments] = useState(() => {
    try {
      const stored = localStorage.getItem("novapos_quickkeys");
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [showPicker, setShowPicker] = useState(null);

  const keys = useMemo(() => ["0","1","2","3","4","5","6","7","8","9"], []);

  useEffect(() => {
    localStorage.setItem("novapos_quickkeys", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      const key = e.key;
      if (keys.includes(key) && assignments[key]) {
        const product = products.find((p) => p.id === assignments[key]);
        if (product) {
          addItem({ id: product.id, name: product.name, price: product.price, image: product.image, stock: product.stock });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [assignments, products, addItem, keys]);

  const handleAssign = (key) => {
    setShowPicker(key);
  };

  const handleSelect = (productId) => {
    setAssignments((prev) => ({ ...prev, [showPicker]: productId }));
    setShowPicker(null);
  };

  const handleClear = (key) => {
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">Quick-Sell Keys</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 14 }}>
            Press a number key (0-9) on any screen to instantly add the assigned product to cart.
          </p>

          <div className="quick-grid">
            {keys.map((k) => {
              const productId = assignments[k];
              const product = productId ? products.find((p) => p.id === productId) : null;
              return (
                <button key={k} className="quick-key-card" onClick={() => handleAssign(k)}>
                  <span className="quick-key-num">{k}</span>
                  {product ? (
                    <div className="quick-key-product">
                      <img src={product.image} alt={product.name} className="quick-key-img" />
                      <span className="quick-key-name">{product.name}</span>
                    </div>
                  ) : (
                    <span className="quick-key-empty">Tap to assign</span>
                  )}
                </button>
              );
            })}
          </div>

          {Object.keys(assignments).length > 0 && (
            <button
              className="admin-btn admin-btn-danger-sm"
              style={{ marginTop: 12, width: "100%" }}
              onClick={() => setAssignments({})}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {showPicker !== null && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setShowPicker(null)}>
          <div className="modal" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title">Assign Key "{showPicker}"</h2>
              <button className="modal-close" onClick={() => setShowPicker(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="dash-orders-list" style={{ maxHeight: 300, overflowY: "auto" }}>
                {products.map((p) => (
                  <button
                    key={p.id}
                    className="dash-order-item"
                    style={{ cursor: "pointer", textAlign: "left", width: "100%" }}
                    onClick={() => handleSelect(p.id)}
                  >
                    <div className="dash-order-top">
                      <img src={p.image} alt={p.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
                      <span style={{ flex: 1, fontWeight: 600, fontSize: "0.85rem" }}>{p.name}</span>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>₹{p.price.toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
