import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {

    const fetchOrders = async () => {
      try {
        const res = await api.get('/sellers/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        console.error('❌ Fetch orders error:', err);
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      console.warn('⚠️ No token found. User might not be logged in as seller.');
      const token = localStorage.getItem('token');
const decoded = jwtDecode(token);

      setError('You are not logged in as a seller.');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div className="text-center mt-5">Loading orders...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  return (
    <div className="container mt-4">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center mt-4">You have no orders yet.</p>
      ) : (
        <div className="list-group">
          {orders.map(order => {
            return (
              <div
                key={order._id}
                className="list-group-item list-group-item-action mb-3 rounded-3 shadow-sm"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">Order Number: {order.orderNumber}</h5>
                  <small>Date: {new Date(order.createdAt).toLocaleDateString()}</small>
                </div>
                <p className="mb-1">
                  Customer: {order.customer?.name} ({order.customer?.email})
                </p>
                <ul className="list-unstyled mt-2 mb-1">
                  {order.products.map(item => {
                    return (
                      <li key={item.product?._id}>
                        {item.product?.name} - Qty: {item.quantity} - Price: ₹
                        {item.product?.price} each
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-2 d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary fs-6">
                    Total Amount: ₹{order.totalAmount.toFixed(2)}
                  </span>
                  <span className="badge bg-info">{order.paymentMethod}</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`badge ${
                      order.status === 'Delivered'
                        ? 'bg-success'
                        : order.status === 'Shipped'
                        ? 'bg-info'
                        : order.status === 'Cancelled'
                        ? 'bg-danger'
                        : 'bg-warning text-dark'
                    }`}
                  >
                    Status: {order.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
