import { useState, useMemo } from "react";
import { useOrders } from "../context/OrderContext";
import { useProducts } from "../context/ProductContext";
import Receipt from "./Receipt";
import GSTInvoice from "./GSTInvoice";
import "./Modal.css";

export default function OrderHistory({ onClose }) {
  const { orders, markPaid, updateOrder } = useOrders();
  const { decrementStock, incrementStock } = useProducts();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [showReceipt, setShowReceipt] = useState(null);
  const [showInvoice, setShowInvoice] = useState(null);
  const [refunding, setRefunding] = useState(null);
  const [refundNote, setRefundNote] = useState("");

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.customerName || "").toLowerCase().includes(q) ||
          (o.customerPhone || "").includes(q)
      );
    }
    if (dateFilter === "today") {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      list = list.filter((o) => new Date(o.timestamp) >= start);
    } else if (dateFilter === "week") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter((o) => o.timestamp >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter((o) => o.timestamp >= monthAgo);
    }
    return list;
  }, [orders, search, dateFilter]);

  const handleRefund = (order) => {
    setRefunding(order.id);
    setRefundNote("");
  };

  const confirmRefund = () => {
    if (!refunding) return;
    const order = orders.find((o) => o.id === refunding);
    if (!order) return;
    order.items.forEach((item) => incrementStock(item.id, item.quantity));
    updateOrder(refunding, { refunded: true, refundNote: refundNote.trim(), refundedAt: Date.now() });
    setRefunding(null);
  };

  return (
    <>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-wide">
          <div className="modal-head">
            <h2 className="modal-title">Order History</h2>
            <button className="modal-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="modal-body">
            <div className="barcode-input-wrap" style={{ marginBottom: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input className="barcode-input" placeholder="Search by ID, customer name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="admin-form-row" style={{ marginBottom: 14 }}>
              {["all", "today", "week", "month"].map((f) => (
                <button
                  key={f}
                  className={`admin-btn ${dateFilter === f ? "admin-btn-primary" : "admin-btn-secondary"}`}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setDateFilter(f)}
                >
                  {f === "all" ? "All" : f === "today" ? "Today" : f === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>

            <div className="dash-orders-list">
              {filtered.map((o) => (
                <div key={o.id} className={`dash-order-item ${o.refunded ? "dash-order-refunded" : ""}`}>
                  <div className="dash-order-top">
                    <span className="dash-order-id">#{o.id}</span>
                    {o.refunded ? (
                      <span className="dash-order-pay" style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}>REFUNDED</span>
                    ) : o.paymentType === "credit" ? (
                      o.duePaid ? <span className="dash-order-pay">PAID</span> : <span className="dash-order-pay" style={{ background: "rgba(253,203,110,0.1)", color: "var(--warning)" }}>DUE</span>
                    ) : (
                      <span className="dash-order-pay">{Array.isArray(o.paymentMethod) ? o.paymentMethod.map(p => p.method).join("+") : (o.paymentMethod?.method || "PAID")}</span>
                    )}
                    <span className="dash-order-total">₹{o.total.toFixed(2)}</span>
                  </div>
                  <div className="dash-order-meta">
                    {new Date(o.timestamp).toLocaleString("en-IN")}
                    {o.customerName ? ` — ${o.customerName}` : ""}
                    {o.tableNumber ? ` — Table ${o.tableNumber}` : ""}
                  </div>
                  {o.refundNote && <div className="dash-order-meta" style={{ color: "var(--danger)", marginTop: 2 }}>Note: {o.refundNote}</div>}
                  <div className="dash-order-actions" style={{ marginTop: 6 }}>
                    <button className="dash-btn dash-btn-small dash-btn-ghost" onClick={() => setShowReceipt(o.id)}>Receipt</button>
                    <button className="dash-btn dash-btn-small dash-btn-ghost" onClick={() => setShowInvoice(o.id)}>Invoice</button>
                    {!o.refunded && (
                      <button className="dash-btn dash-btn-small" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)" }} onClick={() => handleRefund(o)}>
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No orders found</p>}
            </div>
          </div>
        </div>
      </div>

      {refunding && (
        <div className="modal-overlay" onClick={() => setRefunding(null)}>
          <div className="modal" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title">Confirm Refund</h2>
              <button className="modal-close" onClick={() => setRefunding(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 12, color: "var(--text-secondary)" }}>This will restore stock for all items in this order. This cannot be undone.</p>
              <input
                className="admin-input"
                style={{ width: "100%", marginBottom: 12, boxSizing: "border-box" }}
                placeholder="Refund note (optional)"
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
              />
              <div className="admin-reset-actions">
                <button className="admin-btn admin-btn-secondary" onClick={() => setRefunding(null)}>Cancel</button>
                <button className="admin-btn admin-btn-danger" onClick={confirmRefund}>Confirm Refund</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReceipt && <Receipt order={orders.find(o => o.id === showReceipt)} onClose={() => setShowReceipt(null)} />}
      {showInvoice && <GSTInvoice order={orders.find(o => o.id === showInvoice)} onClose={() => setShowInvoice(null)} />}
    </>
  );
}
