import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CustomerContext = createContext();

export const useCustomer = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCustomer = async () => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/customers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomer(res.data);
    } catch (err) {
      console.error('Failed to load customer:', err);
      localStorage.removeItem('customerToken');
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('customerToken');
    setCustomer(null);
    navigate('/');
  };

  useEffect(() => {
    loadCustomer();
  }, []);

  return (
    <CustomerContext.Provider value={{ customer, setCustomer, logout, loading }}>
      {children}
    </CustomerContext.Provider>
  );
};

export { CustomerContext };
