import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { CustomerContext } from '../contexts/CustomerContext';

export default function CustomerProtectedRoute({ children }) {
  const { customer } = useContext(CustomerContext);

  if (!customer) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  // Logged in → allow access
  return children;
}
