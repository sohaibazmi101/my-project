import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { SellerContext } from '../contexts/SellerContext';

export default function SellerProtectedRoute({ children }) {
  const { seller, loading } = useContext(SellerContext);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  if (!seller) {
    return <Navigate to="/login" />;
  }

  return children;
}
