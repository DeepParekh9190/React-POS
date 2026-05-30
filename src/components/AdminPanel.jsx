import { useState, useRef } from "react";
import { useProducts } from "../context/ProductContext";
import "./AdminPanel.css";

const categories = ["Coffee", "Tea", "Pastries", "Sandwiches", "Specials"];

const emptyForm = { name: "", price: "", cost_price: "", category: "Food", image: "", stock: "", hsn: "" };

export default function AdminPanel({ onClose }) {
  const { products, addProduct, updateProduct, deleteProduct, duplicateProduct, resetProducts } = useProducts();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm({ ...form, image: ev.target.result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setForm({ ...form, image: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;

    const product = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      cost_price: parseFloat(form.cost_price) || 0,
      category: form.category,
      image: form.image.trim() || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop`,
      stock: parseInt(form.stock) || 999,
      hsn: form.hsn.trim() || "",
    };

    if (editingId) {
      updateProduct(editingId, product);
    } else {
      addProduct(product);
    }

    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      cost_price: String(product.cost_price || ""),
      category: product.category,
      image: product.image,
      stock: String(product.stock ?? 999),
      hsn: product.hsn || "",
    });
    setEditingId(product.id);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (editingId === id) handleCancel();
    deleteProduct(id);
  };

  const handleReset = () => {
    resetProducts();
    setShowReset(false);
    handleCancel();
  };

  const lowStock = (stock) => stock !== undefined && stock <= 5;

  return (
    <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">
        <div className="admin-header">
          <h2 className="admin-title">Manage Products</h2>
          <button className="admin-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <input className="admin-input" name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
            <input className="admin-input admin-input-sm" name="price" type="number" step="0.01" min="0" placeholder="Price (₹)" value={form.price} onChange={handleChange} required />
            <select className="admin-select" name="category" value={form.category} onChange={handleChange}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="admin-form-row">
            <input className="admin-input admin-input-sm" name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange} />
            <input className="admin-input admin-input-sm" name="cost_price" type="number" step="0.01" min="0" placeholder="Cost Price (₹)" value={form.cost_price} onChange={handleChange} />
            <input className="admin-input" name="hsn" placeholder="HSN Code (e.g. 210690)" value={form.hsn} onChange={handleChange} />
          </div>
          <div className="admin-form-row">
            <div className="admin-image-group">
              <div className="admin-image-inputs">
                <input className="admin-input" name="image" placeholder="Image URL (or upload below)" value={form.image} onChange={handleChange} />
                <div className="admin-image-actions">
                  <button type="button" className="admin-btn admin-btn-upload" onClick={() => fileInputRef.current?.click()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="admin-file-input" onChange={handleFileSelect} />
                  {form.image && <button type="button" className="admin-btn admin-btn-remove-img" onClick={handleRemoveImage}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>}
                </div>
              </div>
              {form.image && <div className="admin-image-preview"><img src={form.image} alt="Preview" /></div>}
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="admin-btn admin-btn-primary">{editingId ? "Update" : "Add Product"}</button>
              {editingId && <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCancel}>Cancel</button>}
            </div>
          </div>
        </form>

        <div className="admin-list-header">
          <span className="admin-list-title">Products ({products.length})</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="admin-btn admin-btn-danger-sm" onClick={() => setShowBulk(true)}>Bulk Import</button>
            <button className="admin-btn admin-btn-danger-sm" onClick={() => setShowReset(true)}>Reset to Defaults</button>
          </div>
        </div>

        <div className="admin-list">
          {products.map((p) => (
            <div key={p.id} className={`admin-item ${editingId === p.id ? "admin-item-editing" : ""}`}>
              <img className="admin-item-img" src={p.image} alt={p.name} />
              <div className="admin-item-info">
                <span className="admin-item-name">{p.name}</span>
                <span className="admin-item-meta">₹{p.price.toFixed(2)} — {p.category}</span>
                <span className={`admin-item-meta ${p.stock !== undefined && p.stock <= 0 ? "admin-out" : lowStock(p.stock) ? "admin-low" : ""}`}>
                  Stock: {p.stock ?? "∞"} {p.hsn ? `| HSN: ${p.hsn}` : ""}
                </span>
              </div>
              <div className="admin-item-actions">
                <button className="admin-action-btn" onClick={() => duplicateProduct(p.id)} title="Duplicate">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button className="admin-action-btn" onClick={() => handleEdit(p)} title="Edit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(p.id)} title="Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {showBulk && (
          <div className="admin-reset-overlay" onClick={() => setShowBulk(false)}>
            <div className="admin-reset-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
              <p style={{ marginBottom: 12 }}>Paste product data (one per line):<br />
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Format: name, price, category, stock, hsn (comma separated)</span>
              </p>
              <textarea
                className="admin-bulk-textarea"
                rows={6}
                placeholder="Coffee, 45, Coffee, 50, 210690&#10;Tea, 30, Tea, 100, 210690"
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                style={{ width: "100%", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)", padding: 10, color: "var(--text-primary)", fontSize: "0.82rem", resize: "vertical", marginBottom: 12, boxSizing: "border-box" }}
              />
              <div className="admin-reset-actions">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowBulk(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={() => {
                  bulkText.split("\n").filter(l => l.trim()).forEach(line => {
                    const parts = line.split(",").map(s => s.trim());
                    if (parts.length >= 2) {
                      addProduct({
                        name: parts[0],
                        price: parseFloat(parts[1]) || 0,
                        cost_price: parts[2] ? parseFloat(parts[2]) || 0 : 0,
                        category: parts[3] || "Food",
                        stock: parseInt(parts[4]) || 999,
                        hsn: parts[5] || "",
                      });
                    }
                  });
                  setBulkText("");
                  setShowBulk(false);
                }}>Import {bulkText.split("\n").filter(l => l.trim()).length} Products</button>
              </div>
            </div>
          </div>
        )}

        {showReset && (
          <div className="admin-reset-overlay" onClick={() => setShowReset(false)}>
            <div className="admin-reset-modal" onClick={(e) => e.stopPropagation()}>
              <p>Reset all products to defaults? Custom products will be lost.</p>
              <div className="admin-reset-actions">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowReset(false)}>Cancel</button>
                <button className="admin-btn admin-btn-danger" onClick={handleReset}>Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
