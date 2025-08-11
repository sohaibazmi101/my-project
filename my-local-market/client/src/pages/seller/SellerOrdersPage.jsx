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
      console.log('🚀 Fetching seller orders...');

      try {
        const res = await api.get('/sellers/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('✅ Orders API response:', res.data);

        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log('📋 Sorted Orders:', sortedOrders);

        setOrders(sortedOrders);
      } catch (err) {
        console.error('❌ Fetch orders error:', err);
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
        console.log('⏳ Finished fetching orders.');
      }
    };

    if (token) {
      fetchOrders();
    } else {
      console.warn('⚠️ No token found. User might not be logged in as seller.');
      const token = localStorage.getItem('token');
const decoded = jwtDecode(token);
console.log(decoded); // should contain sellerId or shopId

// Fetch seller's shopId

console.log(data.shop._id); // shopId to use in requests

      setError('You are not logged in as a seller.');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    console.log('⏳ Rendering loading state...');
    return <div className="text-center mt-5">Loading orders...</div>;
  }

  if (error) {
    console.log('⚠️ Rendering error state:', error);
    return <div className="alert alert-danger">{error}</div>;
  }

  console.log('🎨 Rendering orders list...');

  return (
    <div className="container mt-4">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center mt-4">You have no orders yet.</p>
      ) : (
        <div className="list-group">
          {orders.map(order => {
            console.log(`📝 Rendering order: ${order.orderNumber}`, order);

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
                    console.log(`   📦 Product: ${item.product?.name}`, item);
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
