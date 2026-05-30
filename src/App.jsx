import { useState, useMemo } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { ProductProvider, useProducts } from "./context/ProductContext";
import { SettingsProvider } from "./context/SettingsContext";
import { OrderProvider } from "./context/OrderContext";
import { EmployeeProvider, useEmployees } from "./context/EmployeeContext";
import { CustomerProvider } from "./context/CustomerContext";
import { OfflineProvider } from "./context/OfflineContext";
import Header from "./components/Header";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import EmployeeLogin from "./components/EmployeeLogin";
import CustomerManager from "./components/CustomerManager";
import OrderHistory from "./components/OrderHistory";
import QuickSellBar from "./components/QuickSellBar";
import BarcodeScanner from "./components/BarcodeScanner";
import BackupRestore from "./components/BackupRestore";

const categories = [
  { label: "All", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Coffee", icon: "M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" },
  { label: "Tea", icon: "M12 2v4M8 6h8M6 10h12M8 14h8M10 18h4M9 22h6" },
  { label: "Pastries", icon: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" },
  { label: "Sandwiches", icon: "M3 12h18M3 6h18M3 18h18" },
  { label: "Specials", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
];

function AppContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmployee, setShowEmployee] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showQuickSell, setShowQuickSell] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const { addItem, itemCount } = useCart();
  const { products, getProduct } = useProducts();
  const { currentEmployee } = useEmployees();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || p.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category, products]);

  if (!currentEmployee) {
    return <EmployeeLogin required onClose={() => {}} />;
  }

  const handleAdd = (product) => {
    const p = getProduct(product.id);
    if (p && p.stock !== undefined && p.stock <= 0) {
      alert(`${p.name} is out of stock!`);
      return;
    }
    addItem(product);
  };

  const adminOnly = (fn) => () => {
    if (currentEmployee?.role === "admin") fn();
  };

  return (
    <div className="app">
      <Header
        search={search}
        onSearchChange={setSearch}
        itemCount={itemCount}
        onCartClick={() => setShowCart(true)}
        onCustomerClick={() => setShowCustomer(true)}
        onOrderHistoryClick={() => setShowOrderHistory(true)}
        onQuickSellClick={() => setShowQuickSell(true)}
        onBarcodeClick={() => setShowBarcode(true)}
        onBackupClick={() => setShowBackup(true)}
        onAdminClick={adminOnly(() => setShowAdmin(true))}
        showAdmin={showAdmin}
        onCloseAdmin={() => setShowAdmin(false)}
        onDashboardClick={adminOnly(() => setShowDashboard(true))}
        showDashboard={showDashboard}
        onCloseDashboard={() => setShowDashboard(false)}
        onSettingsClick={adminOnly(() => setShowSettings(true))}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
        onEmployeeClick={() => setShowEmployee(true)}
        showEmployee={showEmployee}
        onCloseEmployee={() => setShowEmployee(false)}
      />
      <div className="main-layout">
        <main className="product-section">
          <div className="product-header">
            <h2 className="product-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Products
            </h2>
            {products.length > 0 && <span className="product-count">{products.length} items</span>}
          </div>
          <div className="cat-strip">
            {categories.map((cat) => (
              <button
                key={cat.label}
                className={`cat-pill ${category === cat.label ? "active" : ""}`}
                onClick={() => setCategory(cat.label)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={cat.icon} />
                </svg>
                {cat.label}
              </button>
            ))}
          </div>
          <ProductList products={filtered} onAdd={handleAdd} />
        </main>
        <Cart />
      </div>
      {showCart && <Cart overlay onClose={() => setShowCart(false)} />}
      {showCustomer && <CustomerManager onClose={() => setShowCustomer(false)} />}
      {showOrderHistory && <OrderHistory onClose={() => setShowOrderHistory(false)} />}
      {showQuickSell && <QuickSellBar onClose={() => setShowQuickSell(false)} />}
      {showBarcode && <BarcodeScanner onSelect={(product) => addItem(product)} onClose={() => setShowBarcode(false)} />}
      {showBackup && <BackupRestore onClose={() => setShowBackup(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <EmployeeProvider>
        <OrderProvider>
          <CustomerProvider>
            <CartProvider>
              <ProductProvider>
                <OfflineProvider>
                  <AppContent />
                </OfflineProvider>
              </ProductProvider>
            </CartProvider>
          </CustomerProvider>
        </OrderProvider>
      </EmployeeProvider>
    </SettingsProvider>
  );
}
