import React, { useEffect, useState } from 'react';
import api from '../../services/api'; // Assuming you have an Axios instance configured

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sellerToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/seller/orders', {
          headers: { Authorization: `Bearer ${sellerToken}` },
        });
        setOrders(res.data);
      } catch (err) {
        setError('Failed to fetch orders.');
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sellerToken) {
      fetchOrders();
    } else {
      setError('You are not logged in as a seller.');
      setLoading(false);
    }
  }, [sellerToken]);

  if (loading) return <div className="text-center mt-5">Loading orders...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center mt-4">You have no orders yet.</p>
      ) : (
        <div className="list-group">
          {orders.map(order => (
            <div key={order._id} className="list-group-item list-group-item-action mb-3 rounded-3 shadow-sm">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">Order ID: {order._id}</h5>
                <small>Date: {new Date(order.createdAt).toLocaleDateString()}</small>
              </div>
              <p className="mb-1">Customer: {order.customer.name} ({order.customer.email})</p>
              <ul className="list-unstyled mt-2 mb-1">
                {order.products.map(item => (
                  <li key={item.product._id}>
                    {item.product.name} - Qty: {item.quantity} - Price: ₹{item.product.price} each
                  </li>
                ))}
              </ul>
              <div className="mt-2 d-flex justify-content-between align-items-center">
                <span className="badge bg-primary fs-6">
                  Total for your products: ₹{order.products.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)}
                </span>
                <span className="badge bg-success">{order.paymentMethod}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}