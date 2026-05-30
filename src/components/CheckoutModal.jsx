import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { useOrders } from "../context/OrderContext";
import { useProducts } from "../context/ProductContext";
import { useEmployees } from "../context/EmployeeContext";
import Receipt from "./Receipt";
import "./CheckoutModal.css";

const paymentMethods = [
  { id: "cash", label: "Cash", icon: "M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" },
  { id: "card", label: "Card", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z" },
  { id: "upi", label: "UPI", icon: "M12 18h.01M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" },
];

export default function CheckoutModal({ onClose }) {
  const { items, subtotal, totalDiscount, clearCart } = useCart();
  const { settings } = useSettings();
  const { addOrder } = useOrders();
  const { decrementStock } = useProducts();
  const { currentEmployee } = useEmployees();
  const overlayRef = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentType, setPaymentType] = useState("full");
  const [dueDate, setDueDate] = useState("");
  const [buyerGst, setBuyerGst] = useState("");
  const [splitPayments, setSplitPayments] = useState([{ method: "cash", amount: "" }]);
  const [tipPercent, setTipPercent] = useState(0);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const taxRate = settings.taxRate || 0;
  const taxable = subtotal - totalDiscount;
  const tax = taxable * (taxRate / 100);
  const tip = (taxable + tax) * (tipPercent / 100);
  const total = taxable + tax + tip;

  const handleSplitChange = (index, field, value) => {
    const updated = [...splitPayments];
    updated[index] = { ...updated[index], [field]: value };
    setSplitPayments(updated);
  };

  const addSplit = () => {
    setSplitPayments([...splitPayments, { method: "cash", amount: "" }]);
  };

  const removeSplit = (index) => {
    if (splitPayments.length > 1) {
      setSplitPayments(splitPayments.filter((_, i) => i !== index));
    }
  };

  const splitTotal = splitPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const splitRemaining = total - splitTotal;

  const handleConfirm = () => {
    const finalPayment = paymentType === "credit"
      ? { method: "credit", amount: total }
      : paymentType === "split"
        ? splitPayments.map((p) => ({ method: p.method, amount: parseFloat(p.amount) || 0 }))
        : { method: paymentMethod, amount: total };

    const order = {
      id: Date.now().toString(36).toUpperCase(),
      timestamp: Date.now(),
      items: items.map((item) => {
        const productInDb = item.id;
        return { id: item.id, name: item.name, price: item.price, quantity: item.quantity, discount: item.discount || 0, image: item.image, hsn: item.hsn || "" };
      }),
      subtotal,
      totalDiscount,
      tax,
      taxRate,
      sgstRate: settings.sgst || 0,
      cgstRate: settings.cgst || 0,
      sgstAmt: tax / 2,
      cgstAmt: tax / 2,
      total,
      tip: { percent: tipPercent, amount: tip },
      paymentMethod: finalPayment,
      paymentType,
      dueDate: paymentType === "credit" ? new Date(dueDate).getTime() : null,
      duePaid: paymentType !== "credit",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      tableNumber: tableNumber.trim(),
      buyerGst: buyerGst.trim(),
      employeeId: currentEmployee?.id || null,
      employeeName: currentEmployee?.name || null,
    };

    items.forEach((item) => {
      decrementStock(item.id, item.quantity);
    });

    addOrder(order);
    clearCart();
    setCompletedOrder(order);
  };

  const handleOverlay = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (completedOrder) {
    return <Receipt order={completedOrder} onClose={onClose} />;
  }

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="modal modal-wide">
        <button className="modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="modal-title">Checkout</h2>
        <p className="modal-subtitle">Review order and select payment</p>

        <div className="modal-items">
          {items.map((item) => (
            <div key={item.id} className="modal-item">
              <span className="modal-item-name">{item.name} <span className="modal-item-qty">x{item.quantity}</span></span>
              <span className="modal-item-price">
                ₹{(item.price * item.quantity).toFixed(2)}
                {item.discount > 0 && <span className="modal-item-discount"> -₹{(item.discount * item.quantity).toFixed(2)}</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="modal-totals">
          <div className="modal-total-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          {totalDiscount > 0 && <div className="modal-total-row modal-total-discount"><span>Discount</span><span>-₹{totalDiscount.toFixed(2)}</span></div>}
          <div className="modal-total-row"><span>SGST ({settings.sgst || 0}%)</span><span>₹{(tax / 2).toFixed(2)}</span></div>
          <div className="modal-total-row"><span>CGST ({settings.cgst || 0}%)</span><span>₹{(tax / 2).toFixed(2)}</span></div>
          <div className="modal-total-row modal-total-final"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </div>

        <div className="modal-payment" style={{ marginBottom: 12 }}>
          <span className="modal-section-label">Tip</span>
          <div className="modal-payment-options" style={{ gap: 4 }}>
            {[0, 5, 10, 15].map((pct) => (
              <button key={pct} className={`modal-payment-btn ${tipPercent === pct ? "active" : ""}`} onClick={() => setTipPercent(tipPercent === pct ? 0 : pct)}>
                {pct === 0 ? "No Tip" : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-payment-type">
          <span className="modal-section-label">Payment Type</span>
          <div className="modal-type-options">
            <button className={`modal-type-btn ${paymentType === "full" ? "active" : ""}`} onClick={() => setPaymentType("full")}>Full Payment</button>
            <button className={`modal-type-btn ${paymentType === "split" ? "active" : ""}`} onClick={() => setPaymentType("split")}>Split</button>
            <button className={`modal-type-btn ${paymentType === "credit" ? "active" : ""}`} onClick={() => setPaymentType("credit")}>Credit / Due</button>
          </div>
        </div>

        {paymentType === "full" && (
          <div className="modal-payment">
            <span className="modal-section-label">Payment Method</span>
            <div className="modal-payment-options">
              {paymentMethods.map((pm) => (
                <button key={pm.id} className={`modal-payment-btn ${paymentMethod === pm.id ? "active" : ""}`} onClick={() => setPaymentMethod(pm.id)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={pm.icon} /></svg>
                  {pm.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {paymentType === "split" && (
          <div className="modal-payment">
            <span className="modal-section-label">Split Payment</span>
            {splitPayments.map((sp, i) => (
              <div key={i} className="modal-split-row">
                <select className="modal-input modal-input-method" value={sp.method} onChange={(e) => handleSplitChange(i, "method", e.target.value)}>
                  {paymentMethods.map((pm) => <option key={pm.id} value={pm.id}>{pm.label}</option>)}
                </select>
                <input className="modal-input modal-input-amt" type="number" min="0" step="0.01" placeholder="Amount" value={sp.amount} onChange={(e) => handleSplitChange(i, "amount", e.target.value)} />
                {splitPayments.length > 1 && (
                  <button className="modal-split-remove" onClick={() => removeSplit(i)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                )}
              </div>
            ))}
            <button className="modal-split-add" onClick={addSplit}>+ Add Another</button>
            <div className="modal-split-summary">
              <span>Allocated: ₹{splitTotal.toFixed(2)}</span>
              <span className={splitRemaining < -0.01 ? "split-excess" : ""}>Remaining: ₹{splitRemaining.toFixed(2)}</span>
            </div>
          </div>
        )}

        {paymentType === "credit" && (
          <div className="modal-payment">
            <span className="modal-section-label">Credit / Due Payment</span>
            <p className="modal-credit-note">Customer will pay later. Set a due date below.</p>
            <input className="modal-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
          </div>
        )}

        <div className="modal-customer">
          <span className="modal-section-label">Customer (required)</span>
          <div className="modal-customer-row">
            <input className="modal-input" placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            <input className="modal-input" placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
            <input className="modal-input modal-input-sm" placeholder="Table #" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
          </div>
          <input className="modal-input modal-input-full" placeholder="Buyer GSTIN (optional)" value={buyerGst} onChange={(e) => setBuyerGst(e.target.value)} />
        </div>

        {currentEmployee && <div className="modal-employee">Staff: {currentEmployee.name}</div>}

        <div className="modal-actions">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn-primary" onClick={handleConfirm}
            disabled={!customerName.trim() || !customerPhone.trim()}
          >
            {paymentType === "credit" ? "Create Due" : paymentType === "split" ? `Pay ₹${total.toFixed(2)}` : `Pay ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
