import { useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import "./Receipt.css";

export default function Receipt({ order, onClose }) {
  const { settings } = useSettings();
  const receiptRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    const pm = Array.isArray(order.paymentMethod)
      ? order.paymentMethod.map(p => `${p.method.toUpperCase()} ₹${p.amount.toFixed(2)}`).join(" + ")
      : (order.paymentMethod?.method ? `${order.paymentMethod.method.toUpperCase()} ₹${order.paymentMethod.amount.toFixed(2)}` : (order.paymentMethod || "").toUpperCase());

    win.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 13px; margin: 20px; color: #000; }
        .receipt { max-width: 300px; margin: 0 auto; }
        h2 { text-align: center; margin: 0 0 4px; font-size: 18px; }
        .store { text-align: center; font-size: 11px; color: #555; margin-bottom: 12px; }
        hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 12px; }
        .total { font-weight: bold; font-size: 14px; border-top: 1px dashed #999; padding-top: 6px; margin-top: 4px; }
        .pay { text-align: center; margin-top: 12px; font-size: 11px; color: #555; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; font-size: 12px; }
        td:last-child { text-align: right; }
        .item-name { max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
        .qty { text-align: center; width: 40px; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <div class="receipt">
        <h2>${settings.storeName}</h2>
        <div class="store">${new Date(order.timestamp).toLocaleString("en-IN")}</div>
        ${order.customerName ? `<div class="store">Customer: ${order.customerName}${order.customerPhone ? ` | ${order.customerPhone}` : ""}</div>` : ""}
        ${order.tableNumber ? `<div class="store">Table: ${order.tableNumber}</div>` : ""}
        ${order.employeeName ? `<div class="store">Staff: ${order.employeeName}</div>` : ""}
        ${order.buyerGst ? `<div class="store">GSTIN: ${order.buyerGst}</div>` : ""}
        <hr>
        <table>${order.items.map(item => `<tr><td class="item-name">${item.name}</td><td class="qty">x${item.quantity}</td><td>₹${(item.price * item.quantity).toFixed(2)}</td></tr>`).join("")}</table>
        <hr>
        <div class="row"><span>Subtotal</span><span>₹${order.subtotal.toFixed(2)}</span></div>
        ${order.totalDiscount > 0 ? `<div class="row" style="color:#e17055"><span>Discount</span><span>-₹${order.totalDiscount.toFixed(2)}</span></div>` : ""}
        <div class="row"><span>SGST @ ${order.sgstRate || "5"}%</span><span>₹${(order.sgstAmt || order.tax / 2 || 0).toFixed(2)}</span></div>
        <div class="row"><span>CGST @ ${order.cgstRate || "5"}%</span><span>₹${(order.cgstAmt || order.tax / 2 || 0).toFixed(2)}</span></div>
        <div class="row total"><span>Total</span><span>₹${order.total.toFixed(2)}</span></div>
        <div class="store" style="margin-top:4px">Payment: ${pm}</div>
        ${order.paymentType === "credit" ? `<div class="store" style="color:#e17055">${order.duePaid ? "PAID" : "DUE — " + new Date(order.dueDate).toLocaleDateString("en-IN")}</div>` : ""}
        <hr>
        <div class="pay">Thank you! Visit again.</div>
      </div>
      <script>window.print();window.close();</script>
      </body></html>
    `);
    win.document.close();
  };

  const pm = Array.isArray(order.paymentMethod)
    ? order.paymentMethod.map(p => `${p.method.toUpperCase()} ₹${p.amount.toFixed(2)}`).join(" + ")
    : (order.paymentMethod?.method ? `${order.paymentMethod.method.toUpperCase()}` : (order.paymentMethod || "").toUpperCase());

  return (
    <>
      <div className="receipt-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="receipt-modal">
          <div className="receipt-header">
            <h2>Order Complete</h2>
            <span className="receipt-check">✓</span>
          </div>

          <div className="receipt-content" ref={receiptRef}>
            <div className="receipt-store">
              <strong>{settings.storeName}</strong>
              <span>{new Date(order.timestamp).toLocaleString("en-IN")}</span>
            </div>
            {order.customerName && (
              <div className="receipt-customer">
                {order.customerName}{order.customerPhone ? ` — ${order.customerPhone}` : ""}
                {order.tableNumber ? ` | Table ${order.tableNumber}` : ""}
              </div>
            )}
            {order.employeeName && <div className="receipt-customer">Staff: {order.employeeName}</div>}

            <div className="receipt-divider" />

            {order.items.map((item, i) => (
              <div key={i} className="receipt-line">
                <span className="receipt-line-name">{item.name} <span className="receipt-line-qty">x{item.quantity}</span></span>
                <span className="receipt-line-price">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="receipt-divider" />

            <div className="receipt-row"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
            {order.totalDiscount > 0 && <div className="receipt-row receipt-row-discount"><span>Discount</span><span>-₹{order.totalDiscount.toFixed(2)}</span></div>}
            <div className="receipt-row"><span>SGST @ {order.sgstRate || "5"}%</span><span>₹{(order.sgstAmt || order.tax / 2 || 0).toFixed(2)}</span></div>
            <div className="receipt-row"><span>CGST @ {order.cgstRate || "5"}%</span><span>₹{(order.cgstAmt || order.tax / 2 || 0).toFixed(2)}</span></div>
            <div className="receipt-divider" />
            <div className="receipt-row receipt-row-total"><span>Total</span><span>₹{order.total.toFixed(2)}</span></div>

            <div className="receipt-payment">Paid via {pm}</div>
            {order.paymentType === "credit" && (
              <div className="receipt-payment" style={{ color: "var(--warning)" }}>
                {order.duePaid ? "PAID" : `DUE — ${new Date(order.dueDate).toLocaleDateString("en-IN")}`}
              </div>
            )}
          </div>

          <div className="receipt-actions">
            <button className="receipt-btn receipt-btn-print" onClick={handlePrint}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Receipt
            </button>
            <button className="receipt-btn receipt-btn-close" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </>
  );
}
