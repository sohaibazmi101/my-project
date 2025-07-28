import { createContext, useContext, useEffect, useState } from 'react';
import { data, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCustomer } from './CustomerContext';

const SellerContext = createContext();
const useSeller = () => useContext(SellerContext);

const SellerProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const customerContext = useCustomer();
  const customerLogout = customerContext?.logout;

  const fetchSeller = async () => {
    try {
      const token = localStorage.getItem('token');
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
    localStorage.setItem('token', token);
    setSeller(sellerData);
    if (customerLogout) customerLogout();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setSeller(null);
    navigate('/');
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

export { SellerContext, SellerProvider, useSeller };
