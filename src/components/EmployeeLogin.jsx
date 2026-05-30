import { useState, useEffect } from "react";
import { useEmployees } from "../context/EmployeeContext";
import "./EmployeeLogin.css";

export default function EmployeeLogin({ onClose, required }) {
  const { employees, currentEmployee, login, logout, addEmployee, deleteEmployee } = useEmployees();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showManage, setShowManage] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    const emp = login(pin);
    if (emp) {
      setPin("");
      onClose();
    } else {
      setError("Invalid PIN");
    }
  };

  const handleAdd = () => {
    if (!newName.trim() || newPin.length < 3) return;
    addEmployee({ name: newName.trim(), pin: newPin, role: "staff" });
    setNewName("");
    setNewPin("");
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  useEffect(() => {
    if (pin.length === 4) {
      setError("");
      const emp = login(pin);
      if (emp) {
        setPin("");
        if (onClose) onClose();
      } else {
        setError("Invalid PIN");
        setPin(""); // Clear so they can try again
      }
    }
  }, [pin, login, onClose]);

  return (
    <div className={`emp-overlay ${required ? "emp-overlay-required" : ""}`} onClick={(e) => { if (required) return; if (e.target === e.currentTarget) onClose(); }}>
      <div className="emp-panel">
        <div className="emp-header">
          <h2 className="emp-title">{currentEmployee ? "Staff" : "Staff Login"}</h2>
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

            <button className="emp-btn emp-btn-manage" onClick={() => setShowManage(!showManage)}>
              {showManage ? "Hide" : "Manage Staff"}
            </button>

            {showManage && (
              <div className="emp-manage">
                <div className="emp-add-row">
                  <input className="emp-input" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <input className="emp-input emp-input-sm" type="password" placeholder="PIN" value={newPin} onChange={(e) => setNewPin(e.target.value)} maxLength={6} />
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
        ) : (
          <form onSubmit={handleLogin}>
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
        )}
      </div>
    </div>
  );
}
