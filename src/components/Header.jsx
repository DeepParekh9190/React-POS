import AdminPanel from "./AdminPanel";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import EmployeeLogin from "./EmployeeLogin";
import { useEmployees } from "../context/EmployeeContext";
import { useSettings } from "../context/SettingsContext";
import "./Header.css";

const categories = [
  { label: "All", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { label: "Coffee", icon: "M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" },
  { label: "Tea", icon: "M12 2v4M8 6h8M6 10h12M8 14h8M10 18h4M9 22h6" },
  { label: "Pastries", icon: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" },
  { label: "Sandwiches", icon: "M3 12h18M3 6h18M3 18h18" },
  { label: "Specials", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
];

export default function Header({
  search, onSearchChange,
  category, onCategoryChange,
  itemCount, onAdminClick, showAdmin, onCloseAdmin,
  onDashboardClick, showDashboard, onCloseDashboard,
  onSettingsClick, showSettings, onCloseSettings,
  onEmployeeClick, showEmployee, onCloseEmployee,
}) {
  const { currentEmployee } = useEmployees();
  const { settings } = useSettings();

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-brand">
              <h1 className="brand-name">{settings.storeName}</h1>
            </div>
            <div className="header-categories">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  className={`cat-pill ${category === cat.label ? "active" : ""}`}
                  onClick={() => onCategoryChange(cat.label)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={cat.icon} />
                  </svg>
                  {cat.label}
                </button>
              ))}
            </div>
            <select
              className="cat-select"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.label} value={cat.label}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="header-right">
            <div className="header-search">
              <svg className="header-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="header-search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <div className="header-actions">
              <button className="ha-btn ha-cart" title="Cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {itemCount > 0 && <span className="ha-cart-badge">{itemCount}</span>}
              </button>
              <button className="ha-btn" onClick={onEmployeeClick} title="Staff">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              <button className="ha-btn ha-btn-desktop" onClick={onDashboardClick} title="Dashboard">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button className="ha-btn ha-btn-desktop" onClick={onAdminClick} title="Products">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <button className="ha-btn" onClick={onSettingsClick} title="Settings">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {showAdmin && <AdminPanel onClose={onCloseAdmin} />}
      {showDashboard && <Dashboard onClose={onCloseDashboard} />}
      {showSettings && <Settings onClose={onCloseSettings} />}
      {showEmployee && <EmployeeLogin onClose={onCloseEmployee} />}
    </>
  );
}
