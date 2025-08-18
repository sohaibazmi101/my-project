import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/sellers/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedOrders = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
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
      setError('You are not logged in as a seller.');
      setLoading(false);
    }
  }, [token]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(
        `/sellers/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('❌ Update order status error:', err);
      alert('Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
          {orders.map((order) => (
            <div
              key={order._id}
              className="list-group-item list-group-item-action mb-3 rounded-3 shadow-sm"
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">Order Number: {order.orderNumber}</h5>
                <small>
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </small>
              </div>
              <p className="mb-1">
                Customer: {order.customer?.name} ({order.customer?.email})
              </p>
              <ul className="list-unstyled mt-2 mb-1">
                {order.products.map((item) => (
                  <li key={item.product?._id}>
                    {item.product?.name} - Qty: {item.quantity} - Price: ₹
                    {item.product?.price} each
                  </li>
                ))}
              </ul>
              <div className="mt-2 d-flex justify-content-between align-items-center">
                <span className="badge bg-primary fs-6">
                  Total Amount: ₹{order.totalAmount.toFixed(2)}
                </span>
                <span
                  className={`badge ${order.paymentStatus === 'completed'
                      ? 'bg-success'
                      : order.paymentStatus === 'failed'
                        ? 'bg-danger'
                        : 'bg-warning text-dark'
                    }`}
                >
                  Payment:{' '}
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </span>
                <span className="badge bg-info">{order.paymentMethod}</span>
              </div>

              {/* Status & Action Buttons */}
              <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
                <span
                  className={`badge ${order.status === 'Delivered'
                      ? 'bg-success'
                      : order.status === 'Cancelled'
                        ? 'bg-danger'
                        : order.status === 'Picked'
                          ? 'bg-primary'
                          : 'bg-warning text-dark'
                    }`}
                  style={{ minWidth: '120px' }}
                >
                  Order Status: {order.status}
                </span>

                {/* Show buttons only if Pending or Picked */}
                {(order.status === 'Pending' || order.status === 'Picked') && (
                  <div>
                    {order.status === 'Pending' && (
                      <button
                        className="btn btn-sm btn-outline-primary me-2 mb-1"
                        disabled={updatingOrderId === order._id}
                        onClick={() =>
                          updateOrderStatus(order._id, 'Picked')
                        }
                      >
                        Mark Picked
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-outline-success me-2 mb-1"
                      disabled={updatingOrderId === order._id}
                      onClick={() =>
                        updateOrderStatus(order._id, 'Delivered')
                      }
                    >
                      Mark Delivered
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger me-2 mb-1"
                      disabled={updatingOrderId === order._id}
                      onClick={() =>
                        updateOrderStatus(order._id, 'Cancelled')
                      }
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
              {order.assignedDeliveryBoy ? (
                <p className="mb-1 text-muted">
                  Delivery Boy: {order.assignedDeliveryBoy.name} ({order.assignedDeliveryBoy.email})
                </p>
              ) : (
                <p className="mb-1 text-muted">Not assigned to any delivery boy yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
