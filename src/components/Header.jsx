import { useState, useEffect } from "react";
import AdminPanel from "./AdminPanel";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import EmployeeLogin from "./EmployeeLogin";
import BiometricGate from "./BiometricGate";
import { useEmployees } from "../context/EmployeeContext";
import { useSettings } from "../context/SettingsContext";
import { useOffline } from "../context/OfflineContext";
import "./Header.css";

export default function Header({
  search, onSearchChange,
  itemCount, onCartClick, onCustomerClick, onOrderHistoryClick, onQuickSellClick, onBarcodeClick, onBackupClick,
  onAdminClick, showAdmin, onCloseAdmin,
  onDashboardClick, showDashboard, onCloseDashboard,
  onSettingsClick, showSettings, onCloseSettings,
  onEmployeeClick, showEmployee, onCloseEmployee,
}) {
  const { currentEmployee } = useEmployees();
  const { settings } = useSettings();
  const { isOnline, queueCount } = useOffline();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    const installedHandler = () => setPwaInstalled(true);
    window.addEventListener("appinstalled", installedHandler);
    if (window.matchMedia("(display-mode: standalone)").matches) setPwaInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") setPwaInstalled(true);
      setDeferredPrompt(null);
      setMenuOpen(false);
    } else if (!pwaInstalled) {
      setShowInstallHelp(true);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-brand">
              <h1 className="brand-name">{settings.storeName}</h1>
              {!isOnline && <span className="offline-badge">Offline{queueCount > 0 ? ` (${queueCount})` : ""}</span>}
            </div>
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
              <button className="ha-btn ha-cart" title="Cart" onClick={onCartClick}>
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
              {currentEmployee?.role === "admin" && (
                <>
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
                  <button className="ha-btn ha-btn-desktop" onClick={onSettingsClick} title="Settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  </button>
                </>
              )}
              <button className="ha-btn ha-btn-desktop" onClick={onBarcodeClick} title="Scan Barcode">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <button className="ha-btn ha-btn-desktop" onClick={onCustomerClick} title="Customers">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" />
                </svg>
              </button>
              <button className="ha-btn ha-hamburger" onClick={() => setMenuOpen(!menuOpen)} title="Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Menu</span>
              <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="mobile-menu-items">
              <button className="mobile-menu-item" onClick={pwaInstalled ? undefined : handleInstall} style={pwaInstalled ? { opacity: 0.6 } : {}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {pwaInstalled ? "Installed" : (deferredPrompt ? "Download POS" : "Install App")}
              </button>
              <button className="mobile-menu-item" onClick={() => { setMenuOpen(false); onEmployeeClick(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Staff
              </button>
              <button className="mobile-menu-item" onClick={() => { setMenuOpen(false); onCustomerClick(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" />
                </svg>
                Customers
              </button>
              <button className="mobile-menu-item" onClick={() => { setMenuOpen(false); onOrderHistoryClick(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Order History
              </button>
              <button className="mobile-menu-item" onClick={() => { setMenuOpen(false); onBarcodeClick(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                </svg>
                Scan Barcode
              </button>
              {currentEmployee?.role === "admin" && (
                <>
                  <BiometricGate onVerified={() => { setMenuOpen(false); onDashboardClick(); }}>
                    <button className="mobile-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                      </svg>
                      Dashboard
                    </button>
                  </BiometricGate>
                  <BiometricGate onVerified={() => { setMenuOpen(false); onAdminClick(); }}>
                    <button className="mobile-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Manage Products
                    </button>
                  </BiometricGate>
                  <BiometricGate onVerified={() => { setMenuOpen(false); onQuickSellClick(); }}>
                    <button className="mobile-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="2" y="2" width="8" height="8" /><rect x="14" y="2" width="8" height="8" /><rect x="2" y="14" width="8" height="8" /><rect x="14" y="14" width="8" height="8" />
                      </svg>
                      Quick-Sell Keys
                    </button>
                  </BiometricGate>
                  <BiometricGate onVerified={() => { setMenuOpen(false); onBackupClick(); }}>
                    <button className="mobile-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Backup & Restore
                    </button>
                  </BiometricGate>
                  <BiometricGate onVerified={() => { setMenuOpen(false); onSettingsClick(); }}>
                    <button className="mobile-menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                      Settings
                    </button>
                  </BiometricGate>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdmin && <AdminPanel onClose={onCloseAdmin} />}
      {showDashboard && <Dashboard onClose={onCloseDashboard} />}
      {showSettings && <Settings onClose={onCloseSettings} />}
      {showEmployee && <EmployeeLogin onClose={onCloseEmployee} />}

      {showInstallHelp && (
        <div className="modal-overlay" onClick={() => setShowInstallHelp(false)}>
          <div className="modal" style={{ maxWidth: "380px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "12px 0" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <h3 style={{ margin: "12px 0 6px", fontSize: "1.1rem" }}>Install Pulse</h3>
              {isIOS ? (
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  <p>Tap the <strong>Share</strong> button <span style={{ fontSize: "1.2rem" }}>⎙</span> in Safari, then scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                </div>
              ) : (
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  <p>Open this site in <strong>Chrome</strong>, tap the menu <strong>⋮</strong> and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                </div>
              )}
              <button className="cart-pay" style={{ marginTop: 16 }} onClick={() => setShowInstallHelp(false)}>Got it</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
