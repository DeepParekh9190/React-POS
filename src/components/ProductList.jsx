import ProductCard from "./ProductCard";
import "./ProductList.css";

export default function ProductList({ products, onAdd }) {
  if (products.length === 0) {
    return (
      <div className="pl-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--text-muted)" }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p>No items found</p>
      </div>
    );
  }

  return (
    <div className="pl-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}
