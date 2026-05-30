import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { useOrders } from "../context/OrderContext";
import { useProducts } from "../context/ProductContext";
import { useEmployees } from "../context/EmployeeContext";
import CartItem from "./CartItem";
import CheckoutModal from "./CheckoutModal";
import Receipt from "./Receipt";
import "./Cart.css";

export default function Cart({ overlay, onClose }) {
  const { items, increase, decrease, removeItem, setDiscount, clearCart, subtotal, totalDiscount, itemCount } = useCart();
  const { settings } = useSettings();
  const { addOrder } = useOrders();
  const { decrementStock } = useProducts();
  const { currentEmployee } = useEmployees();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [tipPercent, setTipPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [completedOrder, setCompletedOrder] = useState(null);

  const taxRate = settings.taxRate || 0;
  const taxable = subtotal - totalDiscount;
  const tax = taxable * (taxRate / 100);
  const tip = (taxable + tax) * (tipPercent / 100);
  const total = taxable + tax + tip;

  const handlePayment = () => {
    const order = {
      id: Date.now().toString(36).toUpperCase(),
      timestamp: Date.now(),
      items: items.map((item) => ({
        id: item.id, name: item.name, price: item.price,
        quantity: item.quantity, discount: item.discount || 0,
        image: item.image, hsn: item.hsn || "",
      })),
      subtotal, totalDiscount, tax, taxRate,
      sgstRate: settings.sgst || 0, cgstRate: settings.cgst || 0,
      sgstAmt: tax / 2, cgstAmt: tax / 2,
      total, tip: { percent: tipPercent, amount: tip },
      paymentMethod: { method: paymentMethod, amount: total },
      paymentType: "full",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      tableNumber: tableNumber.trim(),
      employeeId: currentEmployee?.id || null,
      employeeName: currentEmployee?.name || null,
    };
    items.forEach((item) => decrementStock(item.id, item.quantity));
    addOrder(order);
    clearCart();
    setCompletedOrder(order);
  };

  const renderCartView = () => (
    <>
      <div className="cart-head">
        <div className="cart-head-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>Order</span>
          {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
        </div>
        {overlay ? (
          <button className="cart-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : items.length > 0 ? (
          <button className="cart-clear" onClick={clearCart}>Clear</button>
        ) : null}
      </div>

      <div className="cart-body">
        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Cart empty</p>
            <span>Tap items to add</span>
          </div>
        ) : (
          <div className="cart-items">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={increase}
                onDecrease={decrease}
                onRemove={removeItem}
                onDiscount={setDiscount}
              />
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="cart-foot">
          <div className="cart-summary">
            <div className="cs-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            {totalDiscount > 0 && <div className="cs-row cs-disc"><span>Discount</span><span>-₹{totalDiscount.toFixed(2)}</span></div>}
            <div className="cs-row"><span>Tax ({taxRate}%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="cs-row cs-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          </div>
          {overlay ? (
            <button className="cart-pay" onClick={() => setStep("payment")}>
              Continue →
            </button>
          ) : (
            <button className="cart-pay" disabled={items.length === 0} onClick={() => setShowModal(true)}>
              Pay ₹{total.toFixed(2)}
            </button>
          )}
        </div>
      )}
    </>
  );

  const renderPaymentView = () => (
    <>
      <div className="cart-head">
        <div className="cart-head-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Payment</span>
        </div>
        <button className="cart-close-btn" onClick={() => setStep("cart")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="cart-body">
        <div className="payment-section">
          <span className="payment-label">Customer (required)</span>
          <div className="payment-customer-row">
            <input className="payment-input" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <input className="payment-input" placeholder="Phone Number" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
          <input className="payment-input" style={{ marginTop: 6, width: "100%", boxSizing: "border-box" }} placeholder="Table # (optional)" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
        </div>

        <div className="payment-section">
          <span className="payment-label">Tip</span>
          <div className="payment-options" style={{ gap: 4 }}>
            {[0, 5, 10, 15].map((pct) => (
              <button key={pct} className={`payment-option-btn ${tipPercent === pct ? "active" : ""}`} onClick={() => setTipPercent(tipPercent === pct ? 0 : pct)} style={{ flexDirection: "row", justifyContent: "center", padding: "10px 8px" }}>
                {pct === 0 ? "No Tip" : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="payment-section">
          <span className="payment-label">Payment Method</span>
          <div className="payment-options">
            {[
              { id: "cash", label: "Cash", icon: "M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m2 4h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm7-5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" },
              { id: "upi", label: "UPI", icon: "M12 18h.01M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" },
              { id: "paylater", label: "Pay Later", icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
            ].map((pm) => (
              <button
                key={pm.id}
                className={`payment-option-btn ${paymentMethod === pm.id ? "active" : ""}`}
                onClick={() => setPaymentMethod(pm.id)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={pm.icon} /></svg>
                {pm.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cart-foot">
        <div className="cart-summary">
          <div className="cs-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          {totalDiscount > 0 && <div className="cs-row cs-disc"><span>Discount</span><span>-₹{totalDiscount.toFixed(2)}</span></div>}
          <div className="cs-row"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
          {tip > 0 && <div className="cs-row"><span>Tip ({tipPercent}%)</span><span>₹{tip.toFixed(2)}</span></div>}
          <div className="cs-row cs-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </div>
        <div className="payment-actions">
          <button className="cart-back" onClick={() => setStep("cart")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="cart-pay" disabled={!customerName.trim() || !customerPhone.trim()} onClick={handlePayment}>Pay ₹{total.toFixed(2)}</button>
        </div>
      </div>
    </>
  );

  if (completedOrder) {
    return <Receipt order={completedOrder} onClose={() => { setCompletedOrder(null); if (onClose) onClose(); }} />;
  }

  if (overlay) {
    return (
      <div className="cart-overlay" onClick={onClose}>
        <div className="cart-overlay-panel" onClick={(e) => e.stopPropagation()}>
          {step === "cart" ? renderCartView() : renderPaymentView()}
        </div>
      </div>
    );
  }

  return (
    <>
      <aside className="cart">
        {renderCartView()}
      </aside>
      {showModal && <CheckoutModal onClose={() => setShowModal(false)} />}
    </>
  );
}
