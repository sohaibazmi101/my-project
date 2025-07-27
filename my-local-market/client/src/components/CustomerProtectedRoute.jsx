import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { CustomerContext } from '../contexts/CustomerContext';

export default function CustomerProtectedRoute({ children }) {
  const { customer, loading } = useContext(CustomerContext);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  if (!customer) {
    return <Navigate to="/customer/login" />;
  }

  return children;
}
