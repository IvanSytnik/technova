import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('tn-lang') || 'ua');
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tn-cart') || '[]'); } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tn-wish') || '[]'); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('tn-token') || null);
  const [adminInfo, setAdminInfo] = useState(null);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('tn-cart', JSON.stringify(newCart));
  };

  const switchLang = useCallback((l) => {
    setLang(l);
    localStorage.setItem('tn-lang', l);
  }, []);

  const notify = useCallback((message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      const next = exists
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
      localStorage.setItem('tn-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => {
      const next = prev.filter(i => i.id !== id);
      localStorage.setItem('tn-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCart(prev => {
      const next = prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i);
      localStorage.setItem('tn-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('tn-cart');
  }, []);

  const toggleWishlist = useCallback((id) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('tn-wish', JSON.stringify(next));
      return next;
    });
  }, []);

  const adminLogin = useCallback((token, info) => {
    setAdminToken(token);
    setAdminInfo(info);
    localStorage.setItem('tn-token', token);
  }, []);

  const adminLogout = useCallback(() => {
    setAdminToken(null);
    setAdminInfo(null);
    localStorage.removeItem('tn-token');
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <AppContext.Provider value={{
      lang, switchLang,
      cart, cartCount, cartTotal, cartOpen, setCartOpen,
      addToCart, removeFromCart, updateQty, clearCart,
      wishlist, toggleWishlist,
      notification, notify,
      adminToken, adminInfo, adminLogin, adminLogout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
