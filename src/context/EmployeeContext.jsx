import { createContext, useContext, useState, useCallback, useEffect } from "react";

const EmployeeContext = createContext(null);
const STORAGE_KEY = "novapos_employees";
const CURRENT_KEY = "novapos_current_employee";

const defaultEmployees = [
  { id: "emp1", name: "Admin", pin: "1234", role: "admin", fingerprintEnabled: false, credentialId: null },
];

function loadEmployees() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultEmployees;
}

function loadCurrent() {
  try {
    const stored = localStorage.getItem(CURRENT_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState(loadEmployees);
  const [currentEmployee, setCurrentEmployee] = useState(loadCurrent);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    if (currentEmployee) {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(currentEmployee));
    } else {
      localStorage.removeItem(CURRENT_KEY);
    }
  }, [currentEmployee]);

  const addEmployee = useCallback((emp) => {
    setEmployees((prev) => [...prev, { ...emp, id: "emp" + Date.now(), fingerprintEnabled: false, credentialId: null }]);
  }, []);

  const updateEmployee = useCallback((id, updates) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteEmployee = useCallback((id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setCurrentEmployee((prev) => (prev?.id === id ? null : prev));
  }, []);

  const setFingerprint = useCallback((id, credentialId) => {
    setEmployees((prev) =>
      prev.map((e) => e.id === id ? { ...e, fingerprintEnabled: !!credentialId, credentialId: credentialId || null } : e)
    );
    setCurrentEmployee((prev) =>
      prev?.id === id ? { ...prev, fingerprintEnabled: !!credentialId, credentialId: credentialId || null } : prev
    );
  }, []);

  const login = useCallback((pin) => {
    const emp = employees.find((e) => e.pin === pin);
    if (emp) {
      setCurrentEmployee(emp);
      return emp;
    }
    return null;
  }, [employees]);

  const logout = useCallback(() => {
    setCurrentEmployee(null);
  }, []);

  return (
    <EmployeeContext.Provider
      value={{ employees, currentEmployee, addEmployee, updateEmployee, deleteEmployee, login, logout, setFingerprint }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error("useEmployees must be used within EmployeeProvider");
  return ctx;
}
