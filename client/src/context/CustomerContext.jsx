import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tn-customer-token') || null);
  const [loading, setLoading] = useState(!!localStorage.getItem('tn-customer-token'));

  // Restore session on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch('/api/customers/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.id) setCustomer(data);
        else { setToken(null); localStorage.removeItem('tn-customer-token'); }
      })
      .catch(() => { setToken(null); localStorage.removeItem('tn-customer-token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((tokenStr, customerData) => {
    setToken(tokenStr);
    setCustomer(customerData);
    localStorage.setItem('tn-customer-token', tokenStr);
  }, []);

  const logout = useCallback(() => {
    fetch('/api/customers/logout', { method: 'POST' }).catch(() => {});
    setToken(null);
    setCustomer(null);
    localStorage.removeItem('tn-customer-token');
  }, []);

  const updateCustomer = useCallback((data) => {
    setCustomer(prev => ({ ...prev, ...data }));
  }, []);

  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  }, [token]);

  return (
    <CustomerContext.Provider value={{ customer, token, loading, login, logout, updateCustomer, authFetch, isLoggedIn: !!customer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
};
