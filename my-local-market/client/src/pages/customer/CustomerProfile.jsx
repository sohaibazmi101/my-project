import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../contexts/CustomerContext';
import SmallProductCard from '../../components/SmallProductCard';
import api from '../../services/api';

export default function CustomerProfile() {
  const { customer, logout } = useCustomer();
  const token = localStorage.getItem('customerToken');
  const navigate = useNavigate();
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/customer/login');
    } else {
      api
        .get('/customers/recently-viewed')
        .then((res) => {
          setRecentProducts(res.data.recentlyViewed || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load recently viewed:', err?.response?.data || err.message);
          setRecentProducts([]); // fallback
          setLoading(false);
        });
    }
  }, [token, navigate]);

  return (
    <div className="container-fluid pt-5 mb-5">
      <div className="card shadow p-4 mb-4">
        <div className="d-flex align-items-center mb-4">
        <img
          src={customer?.profileImage || '/default-profile.png'}
          alt="Profile"
          className="rounded-circle me-3"
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
        />
        <h2 className="mb-0">My Profile</h2>
      </div>
        <h5>Details</h5>
        <p><strong>Name:</strong> {customer?.name}</p>
        <p><strong>Email:</strong> {customer?.email}</p>
        <p><strong>Phone:</strong> {customer?.phone}</p>
        <p><strong>Address:</strong> {customer?.address?.street}</p>
        <p><strong>City:</strong> {customer?.address?.city}</p>
        <p><strong>Pincode:</strong> {customer?.address?.pincode}</p>
        <p><strong>State:</strong> {customer?.address?.state}</p>
        <Link to="/customer/update-profile" className="small text-primary mt-2">Edit Profile</Link>
      </div>
      {!loading && recentProducts?.length > 0 && (
        <div className="mb-4">
          <h5>Recently Viewed</h5>
          <div className="d-flex overflow-auto">
            {recentProducts.map((product) => (
              <div key={product._id}>
                <SmallProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && recentProducts?.length === 0 && (
        <p className="text-muted">No recently viewed products.</p>
      )}

      {/* Logout Button using context */}
      <div className="text-center mt-4">
        <button onClick={logout} className="btn btn-outline-danger">
          Logout
        </button>
      </div>
    </div>
  );
}
