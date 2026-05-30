import { useState, useEffect } from "react";
import { useEmployees } from "../context/EmployeeContext";
import { isBiometricAvailable, registerBiometric, verifyBiometric } from "../utils/biometric";
import "./EmployeeLogin.css";

export default function EmployeeLogin({ onClose, required }) {
  const { employees, currentEmployee, login, logout, addEmployee, deleteEmployee, updateEmployee, setFingerprint } = useEmployees();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showManage, setShowManage] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newRole, setNewRole] = useState("staff");
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    handlePinLogin();
  };

  const handlePinLogin = () => {
    setError("");
    const emp = login(pin);
    if (emp && emp.role === role) {
      setPin("");
      if (onClose) onClose();
    } else {
      setError("Invalid PIN");
      setPin("");
    }
  };

  const handleAdd = () => {
    if (!newName.trim() || newPin.length < 3) return;
    addEmployee({ name: newName.trim(), pin: newPin, role: newRole });
    setNewName("");
    setNewPin("");
    setNewRole("staff");
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  useEffect(() => {
    if (pin.length === 4) {
      setError("");
      const emp = login(pin);
      if (emp && emp.role === role) {
        setPin("");
        if (onClose) onClose();
      } else {
        setError("Invalid PIN");
        setPin("");
      }
    }
  }, [pin, login, onClose, role]);

  return (
    <div className={`emp-overlay ${required ? "emp-overlay-required" : ""}`} onClick={(e) => { if (required) return; if (e.target === e.currentTarget) onClose(); }}>
      <div className="emp-panel">
        <div className="emp-header">
          <h2 className="emp-title">{currentEmployee ? "Staff" : role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Login` : "Staff Login"}</h2>
          {required ? null : (
            <button className="emp-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {currentEmployee ? (
          <div className="emp-logged-in">
            <div className="emp-avatar">{currentEmployee.name[0]}</div>
            <strong className="emp-name">{currentEmployee.name}</strong>
            <span className="emp-role">{currentEmployee.role}</span>
            <button className="emp-btn emp-btn-logout" onClick={handleLogout}>Logout</button>

            {currentEmployee.role === "admin" && bioAvailable && (
              <button className="emp-btn emp-btn-manage" onClick={async () => {
                if (currentEmployee.fingerprintEnabled) {
                  setFingerprint(currentEmployee.id, null);
                } else {
                  setBioLoading(true);
                  try {
                    const cred = await registerBiometric(currentEmployee.id);
                    setFingerprint(currentEmployee.id, cred.credentialId);
                  } catch (e) {
                    alert("Fingerprint enrollment failed: " + (e.message || ""));
                  }
                  setBioLoading(false);
                }
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {bioLoading ? "Enrolling..." : currentEmployee.fingerprintEnabled ? "Disable Fingerprint" : "Enable Fingerprint Lock"}
              </button>
            )}
            {currentEmployee.role === "admin" && (
              <button className="emp-btn emp-btn-manage" onClick={() => setShowManage(!showManage)}>
                {showManage ? "Hide" : "Manage Staff"}
              </button>
            )}

            {showManage && currentEmployee.role === "admin" && (
              <div className="emp-manage">
                <div className="emp-add-row">
                  <input className="emp-input" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <input className="emp-input emp-input-sm" type="password" placeholder="PIN" value={newPin} onChange={(e) => setNewPin(e.target.value)} maxLength={6} />
                  <select className="emp-role-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="emp-btn emp-btn-add" onClick={handleAdd}>Add</button>
                </div>
                <div className="emp-list">
                  {employees.map((e) => (
                    <div key={e.id} className="emp-list-item">
                      <span>{e.name}</span>
                      <span className="emp-list-role">{e.role}</span>
                      {e.id !== "emp1" && (
                        <button className="emp-list-del" onClick={() => deleteEmployee(e.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : role ? (
          <form onSubmit={handleLogin}>
            <button type="button" className="emp-back-btn" onClick={() => { setRole(null); setPin(""); setError(""); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 16, textTransform: "capitalize" }}>{role} Login</div>

            {role === "admin" && (() => {
              const admin = employees.find(e => e.role === "admin" && e.fingerprintEnabled && e.credentialId);
              if (!bioAvailable || !admin) return null;
              return (
                <button type="button" className="emp-btn emp-btn-fingerprint"
                  onClick={async () => {
                    setError("");
                    try {
                      const ok = await verifyBiometric(admin.credentialId);
                      if (ok) {
                        login(admin.pin);
                        setPin("");
                        if (onClose) onClose();
                      } else {
                        setError("Fingerprint not recognized");
                      }
                    } catch (e) {
                      setError(e.message || "Biometric error");
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Unlock with Fingerprint
                </button>
              );
            })()}

            {role === "admin" && bioAvailable && employees.find(e => e.role === "admin" && e.fingerprintEnabled && e.credentialId) && (
              <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10 }}>or enter PIN</div>
            )}

            <div className="emp-pin-display">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`emp-pin-dot ${pin[i] ? "filled" : ""}`} />
              ))}
            </div>
            {error && <p className="emp-error">{error}</p>}

            <div className="emp-numpad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((n, i) => (
                n === "" ? <div key={i} /> :
                <button key={i} type="button" className="emp-num-btn"
                  onClick={() => {
                    if (n === "⌫") setPin(p => p.slice(0, -1));
                    else if (pin.length < 4) setPin(p => p + n);
                  }}
                >{n}</button>
              ))}
            </div>
          </form>
        ) : (
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: 20 }}>Select login type</div>
            <button className="emp-role-btn" onClick={() => setRole("admin")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Admin Login
            </button>
            <button className="emp-role-btn emp-role-btn-staff" onClick={() => setRole("staff")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Staff Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
