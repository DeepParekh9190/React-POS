import { useSettings } from "../context/SettingsContext";
import "./GSTInvoice.css";

export default function GSTInvoice({ order, onClose }) {
  const { settings } = useSettings();

  const sgstAmt = order.sgstAmt || (order.tax / 2) || 0;
  const cgstAmt = order.cgstAmt || (order.tax / 2) || 0;
  const sgstRate = order.sgstRate || settings.sgst || 0;
  const cgstRate = order.cgstRate || settings.cgst || 0;

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Tax Invoice - ${order.id}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; margin: 30px; color: #000; }
        .inv { max-width: 700px; margin: 0 auto; border: 1px solid #333; padding: 20px; }
        h1 { text-align: center; font-size: 20px; margin: 0 0 2px; }
        .gstin { text-align: center; font-size: 11px; margin-bottom: 12px; }
        .head { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .head div { font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #333; padding: 5px 6px; text-align: left; font-size: 11px; }
        th { background: #eee; }
        .right { text-align: right; }
        .center { text-align: center; }
        .totals { margin-left: auto; width: 300px; }
        .totals div { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
        .grand { font-weight: bold; font-size: 13px; border-top: 2px solid #333; padding-top: 5px; margin-top: 5px; }
        .footer { text-align: center; font-size: 10px; margin-top: 16px; color: #555; }
        .hsc { font-size: 9px; color: #666; }
      </style></head><body>
      <div class="inv">
        <h1>${settings.storeName}</h1>
        <div class="gstin">${settings.gstin ? `GSTIN: ${settings.gstin}` : "GST Invoice"}</div>
        <div class="head">
          <div><strong>Invoice #:</strong> ${order.id}<br><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString("en-IN")}<br><strong>Time:</strong> ${new Date(order.timestamp).toLocaleTimeString("en-IN")}</div>
          <div style="text-align:right">${order.customerName ? `<strong>Buyer:</strong> ${order.customerName}<br>` : ""}${order.buyerGst ? `<strong>GSTIN:</strong> ${order.buyerGst}<br>` : ""}${order.tableNumber ? `<strong>Table:</strong> ${order.tableNumber}` : ""}</div>
        </div>
        <table>
          <tr><th>#</th><th>Item</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>Disc</th><th>Taxable</th><th>SGST</th><th>CGST</th><th>Total</th></tr>
          ${order.items.map((item, i) => {
            const lineTotal = item.price * item.quantity;
            const discAmt = (item.discount || 0) * item.quantity;
            const taxable = lineTotal - discAmt;
            const itemSgst = taxable * (sgstRate / 100);
            const itemCgst = taxable * (cgstRate / 100);
            return `<tr><td>${i+1}</td><td>${item.name}</td><td class="hsc">${item.hsn || settings.hsnDefault || "-"}</td><td class="center">${item.quantity}</td><td class="right">${item.price.toFixed(2)}</td><td class="right">${discAmt > 0 ? discAmt.toFixed(2) : "-"}</td><td class="right">${taxable.toFixed(2)}</td><td class="right">${itemSgst.toFixed(2)}</td><td class="right">${itemCgst.toFixed(2)}</td><td class="right">${(taxable + itemSgst + itemCgst).toFixed(2)}</td></tr>`;
          }).join("")}
        </table>
        <div class="totals">
          <div><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
          ${order.totalDiscount > 0 ? `<div style="color:#e17055"><span>Discount</span><span>-${order.totalDiscount.toFixed(2)}</span></div>` : ""}
          <div><span>SGST @ ${sgstRate}%</span><span>${sgstAmt.toFixed(2)}</span></div>
          <div><span>CGST @ ${cgstRate}%</span><span>${cgstAmt.toFixed(2)}</span></div>
          <div class="grand"><span>Grand Total</span><span>${order.total.toFixed(2)}</span></div>
        </div>
        ${order.paymentMethod ? `<div style="font-size:11px;margin-top:8px"><strong>Payment:</strong> ${Array.isArray(order.paymentMethod) ? order.paymentMethod.map(p => `${p.method.toUpperCase()} ₹${p.amount.toFixed(2)}`).join(" + ") : order.paymentMethod.toUpperCase()}</div>` : ""}
        <div class="footer">This is a computer-generated invoice. Thank you for your business!</div>
      </div>
      <script>window.print();window.close();</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="gst-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gst-modal">
        <div className="gst-header">
          <h2>GST Invoice</h2>
          <div className="gst-header-actions">
            <button className="gst-btn gst-btn-print" onClick={handlePrint}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Download
            </button>
            <button className="gst-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="inv-preview">
          <div className="inv-store">{settings.storeName}</div>
          {settings.gstin && <div className="inv-gstin">GSTIN: {settings.gstin}</div>}
          <div className="inv-meta">
            <span>Invoice #: {order.id}</span>
            <span>{new Date(order.timestamp).toLocaleDateString("en-IN")}</span>
          </div>
          {(order.customerName || order.buyerGst) && (
            <div className="inv-buyer">
              {order.customerName && <span>{order.customerName}</span>}
              {order.buyerGst && <span>GST: {order.buyerGst}</span>}
            </div>
          )}

          <table className="inv-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Taxable</th>
                <th>SGST</th>
                <th>CGST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => {
                const lineTotal = item.price * item.quantity;
                const discAmt = (item.discount || 0) * item.quantity;
                const taxable = lineTotal - discAmt;
                const itemSgst = taxable * (sgstRate / 100);
                const itemCgst = taxable * (cgstRate / 100);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.name}</td>
                    <td className="inv-hsn">{item.hsn || settings.hsnDefault || "-"}</td>
                    <td className="inv-center">{item.quantity}</td>
                    <td className="inv-right">₹{item.price.toFixed(2)}</td>
                    <td className="inv-right">₹{taxable.toFixed(2)}</td>
                    <td className="inv-right">₹{itemSgst.toFixed(2)}</td>
                    <td className="inv-right">₹{itemCgst.toFixed(2)}</td>
                    <td className="inv-right">₹{(taxable + itemSgst + itemCgst).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="inv-total-row"><span>Subtotal</span><span>₹{order.subtotal.toFixed(2)}</span></div>
            {order.totalDiscount > 0 && <div className="inv-total-row inv-discount"><span>Discount</span><span>-₹{order.totalDiscount.toFixed(2)}</span></div>}
            <div className="inv-total-row"><span>SGST @ {sgstRate}%</span><span>₹{sgstAmt.toFixed(2)}</span></div>
            <div className="inv-total-row"><span>CGST @ {cgstRate}%</span><span>₹{cgstAmt.toFixed(2)}</span></div>
            <div className="inv-total-row inv-grand"><span>Grand Total</span><span>₹{order.total.toFixed(2)}</span></div>
          </div>

          {order.employeeName && <div className="inv-staff">Processed by: {order.employeeName}</div>}
        </div>

        {order.paymentType === "credit" && (
          <div className="inv-credit-note">
            <strong>CREDIT ORDER</strong> — Due by {new Date(order.dueDate).toLocaleDateString("en-IN")}
            {order.duePaid && <span className="inv-paid"> ✓ Paid</span>}
          </div>
        )}
      </div>
    </div>
  );
}
