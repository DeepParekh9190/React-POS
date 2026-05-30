import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import CartItem from "./CartItem";
import CheckoutModal from "./CheckoutModal";
import "./Cart.css";

export default function Cart() {
  const { items, increase, decrease, removeItem, setDiscount, clearCart, subtotal, totalDiscount, itemCount } = useCart();
  const { settings } = useSettings();
  const [showModal, setShowModal] = useState(false);

  const taxRate = settings.taxRate || 0;
  const taxable = subtotal - totalDiscount;
  const tax = taxable * (taxRate / 100);
  const total = taxable + tax;

  return (
    <>
      <aside className="cart">
        <div className="cart-head">
          <div className="cart-head-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Order</span>
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </div>
          {items.length > 0 && (
            <button className="cart-clear" onClick={clearCart}>Clear</button>
          )}
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
            <button className="cart-pay" disabled={items.length === 0} onClick={() => setShowModal(true)}>
              Pay ₹{total.toFixed(2)}
            </button>
          </div>
        )}
      </aside>

      {showModal && <CheckoutModal onClose={() => setShowModal(false)} />}
    </>
  );
}
