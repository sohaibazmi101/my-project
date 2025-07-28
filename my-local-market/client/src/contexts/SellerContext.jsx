import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCustomer } from './CustomerContext';

const SellerContext = createContext();
const useSeller = () => useContext(SellerContext);

const SellerProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { logout: customerLogout } = useCustomer(); // Clean extraction

  const fetchSeller = async () => {
    const token = localStorage.getItem('token'); // Token must be named 'token' as per your login
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/sellers/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSeller(res.data);
    } catch (err) {
      console.error('Error fetching seller:', err);
      localStorage.removeItem('token'); // Remove invalid token
    } finally {
      setLoading(false);
    }
  };

  const login = (sellerData, token) => {
    localStorage.setItem('token', token); // Save under 'token'
    setSeller(sellerData);
    if (customerLogout) customerLogout(); // Mutual exclusivity
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
