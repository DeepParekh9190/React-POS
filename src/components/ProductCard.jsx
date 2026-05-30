import { useProducts } from "../context/ProductContext";
import "./ProductCard.css";

export default function ProductCard({ product, onAdd }) {
  const { lowStockThreshold } = useProducts();
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= lowStockThreshold;

  const handleAdd = (e) => {
    if (e) e.stopPropagation();
    if (!outOfStock) onAdd(product);
  };

  return (
    <div className={`cp-card ${outOfStock ? "cp-out" : ""}`} onClick={handleAdd}>
      <div className="cp-img-wrap">
        <img className="cp-img" src={product.image} alt={product.name} loading="lazy" />
        {lowStock && <span className="cp-badge cp-badge-low">{product.stock}</span>}
        {outOfStock && <span className="cp-badge cp-badge-out">0</span>}
      </div>
      <div className="cp-info">
        <div className="cp-name">{product.name}</div>
        <div className="cp-price">₹{product.price.toFixed(2)}</div>
      </div>
      {!outOfStock && (
        <button className="cp-add" onClick={handleAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
