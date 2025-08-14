import { useEffect, useState } from 'react';
import api from '../services/api';
import SecretCodeModal from '../components/SecretCodeModal';
import UpdateOrderModal from '../components/UpdateOrderModal';

export default function DeliveryBoyDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const token = localStorage.getItem('deliveryBoyToken');

  // Fetch orders assigned to this delivery boy
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery-boy/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      alert(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Pick an order
  const handlePickOrder = async (order) => {
    try {
      const res = await api.patch(`/delivery-boy/orders/${order._id}/pick`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrder(res.data.order);
      setShowSecretModal(true);
      fetchOrders(); // refresh orders
    } catch (err) {
      console.error('Failed to pick order:', err);
      alert(err.response?.data?.message || 'Failed to pick order');
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (!orders.length) return <p>No orders available.</p>;

  return (
    <div className="container mt-4">
      <h3>Delivery Orders</h3>
      {orders.map((order) => (
        <div key={order._id} className="card mb-3">
          <div className="card-body">
            <h5>{order.shop.name}</h5>
            <p>Customer: {order.customer.name}</p>
            <p>Location: {order.customer.address.street}, {order.customer.address.city}</p>
            <p>Total: ₹{order.totalAmount.toFixed(2)}</p>
            <p>Status: {order.status}</p>
            <p>Payment: {order.paymentStatus}</p>
            {!order.assignedDeliveryBoy && (
              <button
                className="btn btn-primary"
                onClick={() => handlePickOrder(order)}
              >
                Pick Order
              </button>
            )}
            {order.assignedDeliveryBoy && order.assignedDeliveryBoy._id === selectedOrder?._id && (
              <button
                className="btn btn-success"
                onClick={() => setShowUpdateModal(true)}
              >
                Update Status
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Modal to show secret code after picking order */}
      {selectedOrder && (
        <SecretCodeModal
          show={showSecretModal}
          secretCode={selectedOrder.secretCode}
          onClose={() => setShowSecretModal(false)}
        />
      )}

      {/* Modal to update order status and payment */}
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
