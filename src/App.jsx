import { useState, useMemo } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import { ProductProvider, useProducts } from "./context/ProductContext";
import { SettingsProvider } from "./context/SettingsContext";
import { OrderProvider } from "./context/OrderContext";
import { EmployeeProvider, useEmployees } from "./context/EmployeeContext";
import Header from "./components/Header";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import EmployeeLogin from "./components/EmployeeLogin";

function AppContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmployee, setShowEmployee] = useState(false);
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

  return (
    <div className="app">
      <Header
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        itemCount={itemCount}
        onAdminClick={() => setShowAdmin(true)}
        showAdmin={showAdmin}
        onCloseAdmin={() => setShowAdmin(false)}
        onDashboardClick={() => setShowDashboard(true)}
        showDashboard={showDashboard}
        onCloseDashboard={() => setShowDashboard(false)}
        onSettingsClick={() => setShowSettings(true)}
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
          <ProductList products={filtered} onAdd={handleAdd} />
        </main>
        <Cart />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <EmployeeProvider>
        <CartProvider>
          <ProductProvider>
            <OrderProvider>
              <AppContent />
            </OrderProvider>
          </ProductProvider>
        </CartProvider>
      </EmployeeProvider>
    </SettingsProvider>
  );
}
