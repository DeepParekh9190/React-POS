import { useState, useRef } from "react";
import { useProducts } from "../context/ProductContext";
import { useOrders } from "../context/OrderContext";
import { useCustomers } from "../context/CustomerContext";
import "./Modal.css";

export default function BackupRestore({ onClose }) {
  const { products, resetProducts, addProduct } = useProducts();
  const { orders, clearHistory } = useOrders();
  const { customers } = useCustomers();
  const fileInputRef = useRef(null);
  const [showImport, setShowImport] = useState(false);
  const [importResult, setImportResult] = useState("");
  const [loading, setLoading] = useState(false);

  const exportJSON = (type) => {
    let data, filename;
    switch (type) {
      case "products":
        data = products; filename = `pulse_products_${new Date().toISOString().split("T")[0]}.json`; break;
      case "orders":
        data = orders; filename = `pulse_orders_${new Date().toISOString().split("T")[0]}.json`; break;
      case "customers":
        data = customers; filename = `pulse_customers_${new Date().toISOString().split("T")[0]}.json`; break;
      case "all":
        data = { products, orders, customers, exportedAt: Date.now() };
        filename = `pulse_full_backup_${new Date().toISOString().split("T")[0]}.json`; break;
      default: return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = (type) => {
    let rows;
    switch (type) {
      case "products":
        rows = [["ID","Name","Price","Cost Price","Category","Stock","HSN Code","Image"]];
        products.forEach((p) => rows.push([p.id, p.name, p.price, p.cost_price || 0, p.category, p.stock ?? "∞", p.hsn || "", p.image || ""]));
        break;
      case "orders":
        rows = [["Order ID","Date","Items","Subtotal","Discount","Tax","Total","Payment","Customer","Phone","Staff"]];
        orders.forEach((o) => {
          const pm = Array.isArray(o.paymentMethod) ? o.paymentMethod.map(p => `${p.method} ₹${p.amount.toFixed(2)}`).join(" + ") : (o.paymentMethod?.method || "");
          rows.push([o.id, new Date(o.timestamp).toLocaleString("en-IN"), o.items.map((i) => `${i.name} x${i.quantity}`).join("; "), o.subtotal.toFixed(2), o.totalDiscount.toFixed(2), o.tax.toFixed(2), o.total.toFixed(2), pm, o.customerName || "", o.customerPhone || "", o.employeeName || ""]);
        });
        break;
      default: return;
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse_${type}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setImportResult("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.products && Array.isArray(data.products)) {
          data.products.forEach((p) => addProduct(p));
          setImportResult(`Imported ${data.products.length} products`);
        } else if (Array.isArray(data)) {
          data.forEach((p) => addProduct(p));
          setImportResult(`Imported ${data.length} items`);
        } else {
          setImportResult("Invalid file format");
        }
      } catch {
        setImportResult("Error parsing JSON file");
      }
      setLoading(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleBulkStock = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setImportResult("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split("\n").filter((l) => l.trim());
        let count = 0;
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(",").map((s) => s.replace(/^"|"$/g, "").trim());
          if (parts.length >= 2) {
            const id = parseInt(parts[0]);
            const stock = parseInt(parts[1]);
            if (!isNaN(id) && !isNaN(stock)) {
              const product = products.find((p) => p.id === id);
              if (product) {
                addProduct({ ...product, stock });
                count++;
              }
            }
          }
        }
        setImportResult(`Updated stock for ${count} products`);
      } catch {
        setImportResult("Error parsing CSV");
      }
      setLoading(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: "460px" }}>
        <div className="modal-head">
          <h2 className="modal-title">Backup & Restore</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <h3 className="dash-section-title">Export</h3>
          <div className="admin-form-row" style={{ marginBottom: 16, flexWrap: "wrap" }}>
            <button className="admin-btn admin-btn-secondary" onClick={() => exportJSON("products")}>Products (JSON)</button>
            <button className="admin-btn admin-btn-secondary" onClick={() => exportJSON("orders")}>Orders (JSON)</button>
            <button className="admin-btn admin-btn-secondary" onClick={() => exportJSON("customers")}>Customers (JSON)</button>
            <button className="admin-btn admin-btn-primary" onClick={() => exportJSON("all")}>Full Backup (JSON)</button>
          </div>
          <div className="admin-form-row" style={{ marginBottom: 16 }}>
            <button className="admin-btn admin-btn-secondary" onClick={() => exportCSV("products")}>Products (CSV)</button>
            <button className="admin-btn admin-btn-secondary" onClick={() => exportCSV("orders")}>Orders (CSV)</button>
          </div>

          <h3 className="dash-section-title">Import Products (JSON)</h3>
          <div className="admin-form-row" style={{ marginBottom: 16 }}>
            <button className="admin-btn admin-btn-primary" onClick={() => fileInputRef.current?.click()}>
              {loading ? "Importing..." : "Choose JSON File"}
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="admin-file-input" onChange={handleImport} />
          </div>

          <h3 className="dash-section-title">Bulk Stock Update (CSV)</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 8 }}>
            CSV format: ID,Stock (one per line, header row required)
          </p>
          <div className="admin-form-row" style={{ marginBottom: 16 }}>
            <button className="admin-btn admin-btn-secondary" onClick={() => document.getElementById("stock-csv-input")?.click()}>
              Upload Stock CSV
            </button>
            <input id="stock-csv-input" type="file" accept=".csv" className="admin-file-input" onChange={handleBulkStock} />
          </div>

          {importResult && <p style={{ color: "var(--accent-2)", fontSize: "0.85rem", fontWeight: 600 }}>{importResult}</p>}
        </div>
      </div>
    </div>
  );
}
