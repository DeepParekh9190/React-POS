import "./CartItem.css";

export default function CartItem({ item, onIncrease, onDecrease, onRemove, onDiscount }) {
  return (
    <div className="ci">
      <img className="ci-img" src={item.image} alt={item.name} />
      <div className="ci-body">
        <div className="ci-top">
          <span className="ci-name">{item.name}</span>
          <span className="ci-price">₹{(item.price * item.quantity).toFixed(2)}</span>
        </div>
        {item.discount > 0 && <span className="ci-disc">-₹{(item.discount * item.quantity).toFixed(2)}</span>}
        <div className="ci-bottom">
          <div className="ci-qty">
            <button className="ci-qty-btn" onClick={() => onDecrease(item.id)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span className="ci-qty-val">{item.quantity}</span>
            <button className="ci-qty-btn" onClick={() => onIncrease(item.id)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
          <div className="ci-extra">
            <input
              type="number"
              className="ci-disc-input"
              min="0"
              max={item.price}
              step="1"
              value={item.discount || ""}
              placeholder="disc"
              onChange={(e) => onDiscount(item.id, parseFloat(e.target.value) || 0)}
            />
            <button className="ci-rm" onClick={() => onRemove(item.id)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
