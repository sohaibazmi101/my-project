import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCustomer } from '../../contexts/CustomerContext';
import ProductCard from '../../components/ProductCard';

export default function CustomerProfile() {
  const { customer, logout } = useCustomer();
  const token = localStorage.getItem('customerToken');
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/customer/login');
      return;
    }

    api.get('/customers/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setOrders(res.data))
      .catch(err => console.error('Failed to load orders', err));
  }, [token, navigate]);

  return (
    <div className="container mt-5 mb-5">
      {/* Profile Section */}
      <h2 className="mb-4">👤 My Profile</h2>
      <div className="card shadow p-4 mb-4">
        <p><strong>Name:</strong> {customer?.name}</p>
        <p><strong>Email:</strong> {customer?.email}</p>
        <p><strong>Phone:</strong> {customer?.phone}</p>
        <button onClick={logout} className="btn btn-danger mt-3">Logout</button>
        <Link to="/customer/update-profile" className="btn btn-outline-primary mt-2">
          Edit Profile
        </Link>
      </div>

      {/* Order History Section */}
      <h4 className="mb-3">📦 My Orders</h4>
      {orders.length === 0 ? (
        <div className="alert alert-info">You have not placed any orders yet.</div>
      ) : (
        <div className="list-group">
          {[...orders].reverse().map(order => (
            <div key={order._id} className="list-group-item mb-4 border rounded shadow-sm p-3">

              {/* Product Cards */}
              <div className="row">
                {order.products.map(item => (
                  <div key={item.product?._id || item._id} className="col-md-4 mb-3">
                    {item.product ? (
                      <ProductCard product={item.product} quantity={item.quantity} showQuantity />
                    ) : (
                      <div className="text-muted small">Product Removed</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Details */}
              <div className="mt-3">
                <div><strong>Order ID:</strong> {order._id}</div>
                <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                <div><strong>Shop:</strong> {order.shop?.name || 'Unknown'}</div>
                <div><strong>Total:</strong> ₹{order.totalAmount}</div>
                <div><strong>Status:</strong> {order.status}</div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
