import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CustomerContext } from '../contexts/CustomerContext';

export default function CustomerProtectedRoute({ children }) {
  const { customer, loading } = useContext(CustomerContext);
  const location = useLocation();

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!customer) {
    // Redirect to login but save intended location
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }

  return children;
}
