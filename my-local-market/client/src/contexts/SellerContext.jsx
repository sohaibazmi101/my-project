import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useCustomer } from './CustomerContext';

const SellerContext = createContext();

export const SellerProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ Safely access logout from useCustomer (may be undefined)
  const customerContext = useCustomer();
  const customerLogout = customerContext?.logout;

  const fetchSeller = async () => {
    try {
      const token = localStorage.getItem('sellerToken');
      if (!token) return setLoading(false);

      const { data } = await api.get('/sellers/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSeller(data);
    } catch (err) {
      console.error('Error fetching seller:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (sellerData, token) => {
    localStorage.setItem('sellerToken', token);
    setSeller(sellerData);

    // 🔐 If customer is logged in, log them out
    if (customerLogout) customerLogout();
  };

  const logout = () => {
    localStorage.removeItem('sellerToken');
    setSeller(null);
  };

  useEffect(() => {
    fetchSeller();
  }, []);

  return (
    <SellerContext.Provider value={{ seller, login, logout, loading }}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => useContext(SellerContext);
