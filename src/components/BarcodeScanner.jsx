import { useState, useRef, useEffect } from "react";
import { useProducts } from "../context/ProductContext";
import "./Modal.css";

export default function BarcodeScanner({ onSelect, onClose }) {
  const { products } = useProducts();
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
      }
    } catch {
      setError("Camera not available. Use manual entry instead.");
    }
  };

  const handleSearch = (val) => {
    setInput(val);
    if (val.trim()) {
      const q = val.trim().toLowerCase();
      const matched = products.filter(
        (p) =>
          String(p.id).includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.hsn && p.hsn.toLowerCase().includes(q))
      );
      setResults(matched);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (product) => {
    onSelect(product);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: "420px" }}>
        <div className="modal-head">
          <h2 className="modal-title">Scan Barcode</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {!scanning ? (
            <button className="barcode-camera-btn" onClick={startCamera}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Open Camera</span>
            </button>
          ) : (
            <div className="barcode-video-wrapper">
              <video ref={videoRef} autoPlay playsInline className="barcode-video" />
              <button className="barcode-stop-btn" onClick={stopCamera}>Stop Camera</button>
            </div>
          )}
          {error && <p className="barcode-error">{error}</p>}

          <div className="barcode-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="barcode-input"
              placeholder="Type barcode / ID / name..."
              value={input}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>

          {results.length > 0 && (
            <div className="barcode-results">
              {results.map((p) => (
                <button key={p.id} className="barcode-result-item" onClick={() => handleSelect(p)}>
                  <img src={p.image} alt={p.name} className="barcode-result-img" />
                  <div className="barcode-result-info">
                    <span className="barcode-result-name">{p.name}</span>
                    <span className="barcode-result-meta">₹{p.price.toFixed(2)} · Stock: {p.stock ?? "∞"}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {input.trim() && results.length === 0 && <p className="barcode-no-results">No products match "{input}"</p>}
        </div>
      </div>
    </div>
  );
}
