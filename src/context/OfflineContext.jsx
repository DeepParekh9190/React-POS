import { createContext, useContext, useState, useCallback, useEffect } from "react";

const OfflineContext = createContext(null);
const QUEUE_KEY = "novapos_offline_queue";

function loadQueue() {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState(loadQueue);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, [queue]);

  const enqueueOrder = useCallback((order) => {
    setQueue((prev) => [...prev, { ...order, queuedAt: Date.now() }]);
  }, []);

  const dequeueOrder = useCallback((orderId) => {
    setQueue((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, queue, enqueueOrder, dequeueOrder, clearQueue, queueCount: queue.length }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline must be used within OfflineProvider");
  return ctx;
}
