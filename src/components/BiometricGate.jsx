import { useState, useEffect } from "react";
import { useEmployees } from "../context/EmployeeContext";
import { isBiometricAvailable, verifyBiometric } from "../utils/biometric";
import "./Modal.css";

export default function BiometricGate({ onVerified, children }) {
  const { currentEmployee } = useEmployees();
  const [showPrompt, setShowPrompt] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const needsBio = isMobile && currentEmployee?.role === "admin" && currentEmployee?.fingerprintEnabled && currentEmployee?.credentialId;

  const handleAction = async () => {
    if (!needsBio) {
      onVerified();
      return;
    }
    setShowPrompt(true);
    setError("");
    try {
      const ok = await verifyBiometric(currentEmployee.credentialId);
      if (ok) {
        setShowPrompt(false);
        onVerified();
      } else {
        setError("Verification failed");
      }
    } catch (e) {
      setError(e.message || "Biometric error. Try again.");
    }
  };

  return (
    <>
      <span onClick={handleAction} style={{ cursor: "pointer", display: "inline-flex" }}>{children}</span>

      {showPrompt && (
        <div className="modal-overlay" onClick={() => setShowPrompt(false)}>
          <div className="modal" style={{ maxWidth: "360px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 0" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2a4 4 0 0 0-4 4v2h8V6a4 4 0 0 0-4-4z" />
                <path d="M6 10v8a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-8H6z" />
                <circle cx="12" cy="15" r="1.5" />
              </svg>
              <h3 style={{ margin: "12px 0 4px", fontSize: "1.1rem" }}>Fingerprint Required</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                Verify your identity to access admin features
              </p>
              {error && <p style={{ color: "var(--danger)", fontSize: "0.82rem", marginTop: 8 }}>{error}</p>}
              <button
                className="cart-pay"
                style={{ marginTop: 16, maxWidth: 200 }}
                onClick={async () => {
                  setError("");
                  try {
                    const ok = await verifyBiometric(currentEmployee.credentialId);
                    if (ok) { setShowPrompt(false); onVerified(); }
                    else setError("Verification failed");
                  } catch (e) {
                    setError(e.message || "Error");
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Scan Fingerprint
              </button>
              <button
                className="cart-back"
                style={{ marginTop: 8, width: "100%", maxWidth: 200 }}
                onClick={() => { setShowPrompt(false); onVerified(); }}
              >
                Use PIN Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
