import { useState, useMemo } from "react";
import { useCustomers } from "../context/CustomerContext";
import { useOrders } from "../context/OrderContext";
import { useCart } from "../context/CartContext";
import "./Modal.css";

export default function CustomerManager({ onClose }) {
  const { customers, updateCustomer } = useCustomers();
  const { orders } = useOrders();
  const { addItem } = useCart();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list"); // list | detail
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [search, customers]);

  const customerOrders = useMemo(() => {
    if (!selected) return [];
    return orders.filter((o) =>
      (selected.phone && o.customerPhone === selected.phone) ||
      (selected.name && o.customerName === selected.name)
    );
  }, [selected, orders]);

  const handleView = (c) => {
    setSelected(c);
    setView("detail");
  };

  const handleEdit = (c) => {
    setEditing(c.id);
    setEditName(c.name);
    setEditPhone(c.phone);
  };

  const handleSave = () => {
    if (editing) {
      updateCustomer(editing, { name: editName.trim(), phone: editPhone.trim() });
      setEditing(null);
    }
  };

  const handleRepeatOrder = (order) => {
    order.items.forEach((item) => {
      addItem({ id: item.id, name: item.name, price: item.price, image: item.image, stock: 999 });
    });
    onClose();
  };

  const pointsToRupees = (pts) => (pts * 0.5).toFixed(0);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-head">
          <h2 className="modal-title">{view === "detail" ? "Customer Details" : "Customers"}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {view === "list" && (
          <div className="modal-body">
            <div className="barcode-input-wrap" style={{ marginBottom: 14 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input className="barcode-input" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="customer-stats">
              <div className="customer-stat"><span>{customers.length}</span>Total Customers</div>
              <div className="customer-stat"><span>₹{customers.reduce((s, c) => s + (c.totalSpent || 0), 0).toFixed(0)}</span>Total Revenue</div>
            </div>

            <div className="dash-orders-list">
              {filtered.map((c) => (
                <div key={c.id} className="dash-order-item" style={{ cursor: "pointer" }} onClick={() => handleView(c)}>
                  <div className="dash-order-top">
                    <span style={{ fontWeight: 600, flex: 1, fontSize: "0.9rem" }}>{c.name}</span>
                    {c.phone && <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{c.phone}</span>}
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>₹{(c.totalSpent || 0).toFixed(0)}</span>
                  </div>
                  <div className="dash-order-meta">
                    {c.visitCount || 0} visits · {(c.loyaltyPoints || 0)} pts
                    {(c.loyaltyPoints || 0) > 0 && ` · ₹${pointsToRupees(c.loyaltyPoints)} value`}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No customers found</p>}
            </div>
          </div>
        )}

        {view === "detail" && selected && (
          <div className="modal-body">
            <button className="dash-btn dash-btn-small dash-btn-ghost" onClick={() => setView("list")} style={{ marginBottom: 12 }}>
              ← Back
            </button>

            {editing === selected.id ? (
              <div className="admin-form-row" style={{ marginBottom: 14 }}>
                <input className="admin-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
                <input className="admin-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Phone" />
                <button className="admin-btn admin-btn-primary" onClick={handleSave}>Save</button>
                <button className="admin-btn admin-btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            ) : (
              <div className="dash-cards" style={{ marginBottom: 14 }}>
                <div className="dash-card">
                  <span className="dash-card-label">{selected.name}</span>
                  <span className="dash-card-value" style={{ fontSize: "0.95rem", fontWeight: 600 }}>{selected.phone || "No phone"}</span>
                </div>
                <div className="dash-card">
                  <span className="dash-card-label">Total Spent</span>
                  <span className="dash-card-value">₹{(selected.totalSpent || 0).toFixed(2)}</span>
                </div>
                <div className="dash-card">
                  <span className="dash-card-label">Visits</span>
                  <span className="dash-card-value">{selected.visitCount || 0}</span>
                </div>
                <div className="dash-card">
                  <span className="dash-card-label">Loyalty Points</span>
                  <span className="dash-card-value">{selected.loyaltyPoints || 0}
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 400, display: "block" }}>
                      = ₹{pointsToRupees(selected.loyaltyPoints)} value
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div className="dash-section">
              <h3 className="dash-section-title">Purchase History ({customerOrders.length})</h3>
              <div className="dash-orders-list">
                {customerOrders.slice(0, 20).map((o) => (
                  <div key={o.id} className="dash-order-item">
                    <div className="dash-order-top">
                      <span className="dash-order-id">#{o.id}</span>
                      <span className="dash-order-total">₹{o.total.toFixed(2)}</span>
                    </div>
                    <div className="dash-order-meta">
                      {new Date(o.timestamp).toLocaleString("en-IN")} · {o.items.length} items
                    </div>
                    <div className="dash-order-actions" style={{ marginTop: 6 }}>
                      <button className="dash-btn dash-btn-small dash-btn-primary" onClick={() => handleRepeatOrder(o)}>
                        Repeat Order
                      </button>
                    </div>
                  </div>
                ))}
                {customerOrders.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No orders yet</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
