import { useEffect, useState } from 'react';
import api from '../../services/api';
import SecretCodeModal from './SecretCodeModal';
import UpdateOrderModal from './UpdateOrderModal';

export default function DeliveryBoyDashboard() {
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const token = localStorage.getItem('deliveryToken');

  const fetchDeliveryBoy = async () => {
    try {
      const res = await api.get('/delivery/db-profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveryBoy(res.data);
      console.log('DB_PROFILE: ', res.data);
    } catch (err) {
      console.error('Failed to fetch delivery boy info:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery-boy/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Orders response:', res.data);
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      alert(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoy();
    fetchOrders();
  }, []);

  const handlePickOrder = async (order) => {
    try {
      const res = await api.patch(`/delivery-boy/orders/${order._id}/pick`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrder(res.data.order);
      setShowSecretModal(true);
      fetchOrders();
    } catch (err) {
      console.error('Failed to pick order:', err);
      alert(err.response?.data?.message || 'Failed to pick order');
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await api.patch(
        '/delivery/availability', 
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDeliveryBoy((prev) => ({
        ...prev,
        isActive: res.data.isActive
      }));

      // Show status message based on new state
      if (res.data.isActive) {
        setStatusMessage('✅ You are now active and available for deliveries.');
      } else {
        setStatusMessage('❌ You are now inactive and will not receive new orders.');
      }

      // Clear message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000);

    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-4">

      {deliveryBoy && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h4 className="card-title">Welcome, {deliveryBoy.name}</h4>
            <p><strong>Email:</strong> {deliveryBoy.email || '-'}</p>
            <p><strong>Phone:</strong> {deliveryBoy.phone || '-'}</p>
            <p>Status: {deliveryBoy?.isActive ? '✅ Active' : '❌ Inactive'}</p>
            
            {/* Availability toggle button */}
            <button
              onClick={toggleAvailability}
              style={{
                background: deliveryBoy?.isActive ? 'red' : 'green',
                color: 'white',
                padding: '8px 12px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {deliveryBoy?.isActive ? 'Deactivate' : 'Activate'}
            </button>

            {/* Status change message */}
            {statusMessage && (
              <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{statusMessage}</p>
            )}
          </div>
        </div>
      )}

      <h4 className="mt-4">Your Orders</h4>
      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover mt-2">
            <thead className="table-dark">
              <tr>
                <th>Shop</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.shop?.name}</td>
                  <td>{order.customer?.name}</td>
                  <td>
                    {order.customer?.address?.street},{" "}
                    {order.customer?.address?.city}
                  </td>
                  <td>{order.totalAmount.toFixed(2)}</td>
                  <td>{order.status}</td>
                  <td>{order.paymentStatus}</td>
                  <td>
                    {!order.assignedDeliveryBoy ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handlePickOrder(order)}
                      >
                        Pick Order
                      </button>
                    ) : order.assignedDeliveryBoy?.toString() === deliveryBoy._id
                    === deliveryBoy._id ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => setShowUpdateModal(true)}
                      >
                        Update Status
                      </button>
                    ) : (
                      <span>Assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Secret Code Modal */}
      {selectedOrder && (
        <SecretCodeModal
          show={showSecretModal}
          secretCode={selectedOrder.secretCode}
          onClose={() => setShowSecretModal(false)}
        />
      )}

      {/* Update Order Modal */}
      {selectedOrder && (
        <UpdateOrderModal
          show={showUpdateModal}
          order={selectedOrder}
          onClose={() => setShowUpdateModal(false)}
          refreshOrders={fetchOrders}
        />
      )}
    </div>
  );
}
