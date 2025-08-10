import React, { useEffect, useState } from 'react';
import api from '../../services/api'; // Assuming you have an Axios instance configured
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure Bootstrap is imported for table styling

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
            <thead className="thead-dark">
              <tr>
                <th scope="col">Order ID</th>
                <th scope="col">Date</th>
                <th scope="col">Customer Name</th>
                <th scope="col">Shop Name</th>
                <th scope="col">Total Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  {/* Using optional chaining for safe access */}
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>{order.shop?.name || 'N/A'}</td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                  {/* Assuming you will add a status field to your Order model */}
                  <td>
                    <span className="badge bg-warning text-dark">Pending</span>
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