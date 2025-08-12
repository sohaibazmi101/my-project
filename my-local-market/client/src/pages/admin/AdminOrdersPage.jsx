import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });

        // Sort orders by creation date in descending order (most recent first)
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        setError('Failed to fetch orders.');
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (adminToken) {
      fetchOrders();
    } else {
      setError('You are not logged in as an admin.');
      setLoading(false);
    }
  }, [adminToken]);

  if (loading) return <div className="text-center mt-5">Loading orders...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center mt-4">No orders have been placed yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th scope="col">Order Number</th>
                <th scope="col">Date</th>
                <th scope="col">Customer Name</th>
                <th scope="col">Shop Code</th>
                <th scope="col">Product Codes</th>
                <th scope="col">Total Amount</th>
                <th scope="col">Payment Method</th>
                <th scope="col">Payment Status</th>
                <th scope="col">Order Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>{order.shop?.shopCode || 'N/A'}</td>
                  <td>
                    {order.products.map(item => item.product?.productCode).join(', ')}
                  </td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{order.paymentStatus}</td>
                  <td>
                    <span className={`badge ${
                      order.status === 'Delivered' ? 'bg-success' :
                      order.status === 'Shipped' ? 'bg-info' :
                      order.status === 'Cancelled' ? 'bg-danger' :
                      'bg-warning text-dark'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}