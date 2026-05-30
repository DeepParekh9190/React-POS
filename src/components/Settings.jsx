import { useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import "./Settings.css";

export default function Settings({ onClose }) {
  const { settings, updateSetting } = useSettings();
  const fileInputRef = useRef(null);

  const exportAll = () => {
    const data = {
      settings: localStorage.getItem("novapos_settings"),
      products: localStorage.getItem("novapos_products"),
      orders: localStorage.getItem("novapos_orders"),
      employees: localStorage.getItem("novapos_employees"),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `novapos_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAll = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.settings) localStorage.setItem("novapos_settings", data.settings);
        if (data.products) localStorage.setItem("novapos_products", data.products);
        if (data.orders) localStorage.setItem("novapos_orders", data.orders);
        if (data.employees) localStorage.setItem("novapos_employees", data.employees);
        alert("Data imported successfully! Please refresh the page.");
        window.location.reload();
      } catch (err) {
        alert("Invalid backup file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearAll = () => {
    if (confirm("Clear ALL local data? This cannot be undone.")) {
      localStorage.removeItem("novapos_settings");
      localStorage.removeItem("novapos_products");
      localStorage.removeItem("novapos_orders");
      localStorage.removeItem("novapos_employees");
      localStorage.removeItem("novapos_current_employee");
      window.location.reload();
    }
  };

  return (
    <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-panel settings-panel-wide">
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-scroll">
          <h3 className="settings-group-title">Store Details</h3>
          <div className="settings-fields">
            <label className="settings-field">
              <span className="settings-label">Store Name</span>
              <input className="settings-input" value={settings.storeName} onChange={(e) => updateSetting("storeName", e.target.value)} />
            </label>
            <label className="settings-field">
              <span className="settings-label">GSTIN</span>
              <input className="settings-input" placeholder="e.g. 27ABCDE1234F1Z5" value={settings.gstin} onChange={(e) => updateSetting("gstin", e.target.value)} />
            </label>
          </div>

          <h3 className="settings-group-title">Tax Rates</h3>
          <div className="settings-fields">
            <div className="settings-row">
              <label className="settings-field">
                <span className="settings-label">SGST (%)</span>
                <input className="settings-input settings-input-sm" type="number" step="0.1" min="0" max="100" value={settings.sgst} onChange={(e) => updateSetting("sgst", parseFloat(e.target.value) || 0)} />
              </label>
              <label className="settings-field">
                <span className="settings-label">CGST (%)</span>
                <input className="settings-input settings-input-sm" type="number" step="0.1" min="0" max="100" value={settings.cgst} onChange={(e) => updateSetting("cgst", parseFloat(e.target.value) || 0)} />
              </label>
            </div>
            <label className="settings-field">
              <span className="settings-label">Total Tax Rate (%)</span>
              <input className="settings-input" type="number" step="0.1" min="0" max="100" value={settings.taxRate} onChange={(e) => updateSetting("taxRate", parseFloat(e.target.value) || 0)} />
            </label>
            <label className="settings-field">
              <span className="settings-label">Default HSN Code</span>
              <input className="settings-input" placeholder="e.g. 210690" value={settings.hsnDefault} onChange={(e) => updateSetting("hsnDefault", e.target.value)} />
            </label>
            <div className="settings-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              SGST + CGST should equal the total tax rate.
            </div>
          </div>

          <h3 className="settings-group-title">Backup & Cloud</h3>
          <div className="settings-fields">
            <div className="settings-btn-row">
              <button className="settings-action-btn" onClick={exportAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Backup
              </button>
              <button className="settings-action-btn" onClick={importAll}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Import Backup
              </button>
              <input ref={fileInputRef} type="file" accept=".json" className="settings-file-input" onChange={handleImport} />
            </div>
            <div className="settings-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Backup includes all products, orders, employees, and settings. Importing will replace all current data.
            </div>
            <button className="settings-action-btn settings-action-danger" onClick={clearAll}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
