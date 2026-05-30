import { useMemo, useState } from "react";
import { useOrders } from "../context/OrderContext";
import { useProducts } from "../context/ProductContext";
import Receipt from "./Receipt";
import GSTInvoice from "./GSTInvoice";
import "./Dashboard.css";

export default function Dashboard({ onClose }) {
  const { orders, clearHistory, markPaid } = useOrders();
  const { products } = useProducts();
  const [showInvoice, setShowInvoice] = useState(null);
  const [showReceipt, setShowReceipt] = useState(null);
  const [period, setPeriod] = useState("all");

  const filteredOrders = useMemo(() => {
    if (period === "today") {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      return orders.filter((o) => new Date(o.timestamp) >= start);
    } else if (period === "week") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => o.timestamp >= weekAgo);
    } else if (period === "month") {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => o.timestamp >= monthAgo);
    }
    return orders;
  }, [orders, period]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o) => new Date(o.timestamp) >= today);
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const filteredRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
    const dueOrders = orders.filter((o) => o.paymentType === "credit" && !o.duePaid);
    const dueTotal = dueOrders.reduce((s, o) => s + o.total, 0);

    // Top products
    const productCount = {};
    filteredOrders.forEach((o) =>
      o.items.forEach((item) => {
        productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
      })
    );
    const topProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Profit tracking
    let totalProfit = 0;
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const product = products.find((p) => p.id === item.id);
        if (product && product.cost_price) {
          totalProfit += (item.price - product.cost_price) * item.quantity;
        }
      });
    });

    // Daily sales for chart (last 7 days)
    const daily = {};
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split("T")[0];
      daily[key] = { label: i === 0 ? "Today" : dayNames[d.getDay()], total: 0, count: 0 };
    }
    filteredOrders.forEach((o) => {
      const key = new Date(o.timestamp).toISOString().split("T")[0];
      if (daily[key]) {
        daily[key].total += o.total;
        daily[key].count += 1;
      }
    });
    const chartData = Object.entries(daily).map(([key, val]) => ({ ...val, key }));

    // Peak hours
    const hourBuckets = {};
    for (let h = 0; h < 24; h++) hourBuckets[h] = 0;
    filteredOrders.forEach((o) => {
      const h = new Date(o.timestamp).getHours();
      hourBuckets[h] = (hourBuckets[h] || 0) + 1;
    });
    const maxHourCount = Math.max(...Object.values(hourBuckets), 1);

    const storeCost = products.reduce((s, p) => s + ((p.cost_price || 0) * (p.stock || 0)), 0);

    return {
      totalRevenue, todayRevenue, filteredRevenue,
      totalOrders: orders.length,
      filteredOrders: filteredOrders.length,
      todayOrders: todayOrders.length,
      topProducts, dueOrders, dueTotal,
      totalProfit, chartData,
      hourBuckets, maxHourCount, storeCost,
    };
  }, [orders, filteredOrders, products]);

  const maxChartVal = Math.max(...stats.chartData.map((d) => d.total), 1);

  const exportCSV = () => {
    const rows = [["Order ID", "Date", "Items", "Subtotal", "Discount", "SGST", "CGST", "Total", "Payment", "Type", "Customer", "Table", "Staff", "Buyer GST"]];
    orders.forEach((o) => {
      const pm = Array.isArray(o.paymentMethod) ? o.paymentMethod.map(p => `${p.method} ₹${p.amount.toFixed(2)}`).join(" + ") : (o.paymentMethod?.method ? `${o.paymentMethod.method} ₹${o.paymentMethod.amount.toFixed(2)}` : o.paymentMethod || "");
      rows.push([
        o.id, new Date(o.timestamp).toLocaleString("en-IN"),
        o.items.map((i) => `${i.name} x${i.quantity}`).join("; "),
        o.subtotal.toFixed(2), o.totalDiscount.toFixed(2),
        (o.sgstAmt || o.tax / 2).toFixed(2), (o.cgstAmt || o.tax / 2).toFixed(2),
        o.total.toFixed(2), pm, o.paymentType || "full",
        o.customerName || "", o.tableNumber || "",
        o.employeeName || "", o.buyerGst || "",
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const invoiceToShow = showInvoice ? orders.find(o => o.id === showInvoice) : null;
  const receiptToShow = showReceipt ? orders.find(o => o.id === showReceipt) : null;

  return (
    <>
      <div className="dash-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="dash-panel">
          <div className="dash-header">
            <h2 className="dash-title">Dashboard</h2>
            <div className="dash-header-actions">
              <button className="dash-btn dash-btn-export" onClick={exportCSV} disabled={orders.length === 0}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
              <button className="dash-close" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="dash-period-filter">
            {["today", "week", "month", "all"].map((p) => (
              <button key={p} className={`dash-period-btn ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>
                {p === "today" ? "Today" : p === "week" ? "This Week" : p === "month" ? "This Month" : "All Time"}
              </button>
            ))}
          </div>

          <div className="dash-cards">
            <div className="dash-card"><span className="dash-card-label">Revenue ({period})</span><span className="dash-card-value">₹{stats.filteredRevenue.toFixed(2)}</span></div>
            <div className="dash-card"><span className="dash-card-label">Orders ({period})</span><span className="dash-card-value">{stats.filteredOrders}</span></div>
            <div className="dash-card"><span className="dash-card-label">Total Revenue</span><span className="dash-card-value">₹{stats.totalRevenue.toFixed(2)}</span></div>
            <div className="dash-card"><span className="dash-card-label">Total Orders</span><span className="dash-card-value">{stats.totalOrders}</span></div>
            {stats.totalProfit !== 0 && (
              <div className="dash-card"><span className="dash-card-label">Est. Profit ({period})</span><span className="dash-card-value" style={{ color: stats.totalProfit >= 0 ? "var(--success)" : "var(--danger)" }}>₹{stats.totalProfit.toFixed(2)}</span></div>
            )}
            {stats.dueOrders.length > 0 && (
              <div className="dash-card dash-card-warn">
                <span className="dash-card-label">Due Payments</span>
                <span className="dash-card-value">{stats.dueOrders.length} (₹{stats.dueTotal.toFixed(2)})</span>
              </div>
            )}
          </div>

          {/* Sales Chart */}
          {stats.chartData.some((d) => d.total > 0) && (
            <div className="dash-section">
              <h3 className="dash-section-title">Daily Sales (Last 7 Days)</h3>
              <div className="dash-chart">
                {stats.chartData.map((d) => (
                  <div key={d.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className="dash-bar" style={{ height: `${Math.max(4, (d.total / maxChartVal) * 100)}%`, width: "100%" }} title={`₹${d.total.toFixed(2)}`} />
                    <span className="dash-bar-label">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Peak Hours */}
          {stats.filteredOrders > 0 && (
            <div className="dash-section">
              <h3 className="dash-section-title">Peak Hours (Orders by Hour)</h3>
              <div className="dash-peak-grid">
                {Array.from({ length: 24 }, (_, i) => {
                  const count = stats.hourBuckets[i] || 0;
                  const intensity = count / stats.maxHourCount;
                  const bg = intensity > 0.7 ? "rgba(124, 58, 237, 0.7)" : intensity > 0.4 ? "rgba(124, 58, 237, 0.4)" : intensity > 0.1 ? "rgba(124, 58, 237, 0.2)" : "var(--glass-bg)";
                  return (
                    <div key={i} className="dash-peak-cell" style={{ background: bg }} title={`${i}:00 — ${count} orders`}>
                      {i % 3 === 0 ? `${i}` : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profit Breakdown */}
          {stats.totalProfit !== 0 && (
            <div className="dash-section">
              <h3 className="dash-section-title">Profit Breakdown</h3>
              <div className="dash-card" style={{ padding: "10px 14px" }}>
                <div className="dash-profit-row"><span className="dash-profit-label">Revenue ({period})</span><span className="dash-profit-value">₹{stats.filteredRevenue.toFixed(2)}</span></div>
                <div className="dash-profit-row"><span className="dash-profit-label">Est. Profit ({period})</span><span className={stats.totalProfit >= 0 ? "dash-profit-value" : "dash-profit-loss"}>₹{stats.totalProfit.toFixed(2)}</span></div>
                <div className="dash-profit-row"><span className="dash-profit-label">Margin</span><span className="dash-profit-value">{stats.filteredRevenue > 0 ? ((stats.totalProfit / stats.filteredRevenue) * 100).toFixed(1) : 0}%</span></div>
              </div>
            </div>
          )}

          {stats.dueOrders.length > 0 && (
            <div className="dash-section">
              <h3 className="dash-section-title">Due / Credit Orders</h3>
              <div className="dash-orders-list">
                {stats.dueOrders.map((o) => (
                  <div key={o.id} className="dash-order-item dash-order-due">
                    <div className="dash-order-top">
                      <span className="dash-order-id">#{o.id}</span>
                      <span className="dash-order-pay">DUE</span>
                      <span className="dash-order-customer">{o.customerName}</span>
                      <span className="dash-order-total">₹{o.total.toFixed(2)}</span>
                    </div>
                    <div className="dash-order-meta">
                      Due: {new Date(o.dueDate).toLocaleDateString("en-IN")}
                      {new Date(o.dueDate) < new Date() && <span className="dash-overdue"> OVERDUE</span>}
                    </div>
                    <div className="dash-due-actions">
                      <button className="dash-btn dash-btn-small dash-btn-primary" onClick={() => { markPaid(o.id); setShowInvoice(o.id); }}>Mark Paid</button>
                      <button className="dash-btn dash-btn-small dash-btn-ghost" onClick={() => setShowInvoice(o.id)}>Invoice</button>
                      <button className="dash-btn dash-btn-small dash-btn-ghost" onClick={() => setShowReceipt(o.id)}>Receipt</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.topProducts.length > 0 && (
            <div className="dash-section">
              <h3 className="dash-section-title">Top Products ({period})</h3>
              <div className="dash-top-list">
                {stats.topProducts.map(([name, qty], i) => (
                  <div key={name} className="dash-top-item">
                    <span className="dash-top-rank">#{i + 1}</span>
                    <span className="dash-top-name">{name}</span>
                    <span className="dash-top-qty">{qty} sold</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orders.length > 0 && (
            <div className="dash-section">
              <h3 className="dash-section-title">Recent Orders</h3>
              <div className="dash-orders-list">
                {orders.slice(0, 20).map((o) => (
                  <div key={o.id} className="dash-order-item">
                    <div className="dash-order-top">
                      <span className="dash-order-id">#{o.id}</span>
                      <span className="dash-order-pay">{o.paymentType === "credit" ? (o.duePaid ? "PAID" : "DUE") : (Array.isArray(o.paymentMethod) ? o.paymentMethod.map(p => p.method).join("+") : (o.paymentMethod?.method || o.paymentMethod || ""))}</span>
                      {o.employeeName && <span className="dash-order-staff">{o.employeeName}</span>}
                      <span className="dash-order-total">₹{o.total.toFixed(2)}</span>
                    </div>
                    <div className="dash-order-meta">
                      {new Date(o.timestamp).toLocaleString("en-IN")}
                      {o.customerName ? ` — ${o.customerName}` : ""}
                      {o.tableNumber ? ` — Table ${o.tableNumber}` : ""}
                    </div>
                    <div className="dash-order-actions">
                      <button className="dash-btn dash-btn-small dash-btn-ghost" onClick={() => setShowReceipt(o.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                        Receipt
                      </button>
                      <button className="dash-btn dash-btn-small dash-btn-ghost" onClick={() => setShowInvoice(o.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        GST Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orders.length > 0 && (
            <button className="dash-btn dash-btn-clear" onClick={() => { if (confirm("Clear all order history?")) clearHistory(); }}>
              Clear History
            </button>
          )}
        </div>
      </div>

      {receiptToShow && <Receipt order={receiptToShow} onClose={() => setShowReceipt(null)} />}
      {invoiceToShow && <GSTInvoice order={invoiceToShow} onClose={() => setShowInvoice(null)} />}
    </>
  );
}
