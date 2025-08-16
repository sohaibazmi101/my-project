import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PickedOrdersModal from './PickedOrdersModal';

export default function DeliveryBoyDashboard() {
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [pickedOrders, setPickedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPickedModal, setShowPickedModal] = useState(false);

  const token = localStorage.getItem('deliveryToken');
  const navigate = useNavigate();

  // If no token, don't fetch anything
  useEffect(() => {
    if (!token) return;

    const init = async () => {
      setLoading(true);
      await fetchDeliveryBoy();
      await fetchAvailableOrders();
      await fetchPickedOrders();
      setLoading(false);
    };
    init();
  }, [token]);

  // Fetch delivery boy profile
  const fetchDeliveryBoy = async () => {
    try {
      const res = await api.get('/delivery/db-profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveryBoy(res.data);
    } catch (err) {
      console.error('Failed to fetch delivery boy info:', err);
    }
  };

  // Fetch available orders
  const fetchAvailableOrders = async () => {
    try {
      const res = await api.get('/delivery-boy/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableOrders(res.data.orders.filter(order => !order.assignedDeliveryBoy));
    } catch (err) {
      console.error('Failed to fetch available orders:', err);
    }
  };

  // Fetch picked orders
  const fetchPickedOrders = async () => {
    try {
      const res = await api.get('/delivery-boy/orders/picked', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPickedOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to fetch picked orders:', err);
    }
  };

  // Pick order
  const handlePickOrder = async (order) => {
    try {
      await api.patch(
        `/delivery-boy/orders/${order._id}/pick`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAvailableOrders();
      fetchPickedOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to pick order');
    }
  };

  // Toggle availability
  const toggleAvailability = async () => {
    try {
      const res = await api.patch(
        '/delivery/availability',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeliveryBoy(prev => ({ ...prev, isActive: res.data.isActive }));
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [address.street, address.city, address.state, address.pincode].filter(Boolean);
    return parts.join(', ');
  };

  if (!token) {
    return (
      <div className="container mt-5 text-center">
        <h3>You need to login first to manage your orders</h3>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate('/deliveylogin')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      {deliveryBoy && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h4>Welcome, {deliveryBoy.name}</h4>
            <p>Status: {deliveryBoy.isActive ? '✅ Active' : '❌ Inactive'}</p>
            <button
              onClick={toggleAvailability}
              className={`btn ${deliveryBoy.isActive ? 'btn-danger' : 'btn-success'}`}
            >
              {deliveryBoy.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      )}

      <button
        className="btn btn-info mb-3"
        onClick={() => setShowPickedModal(true)}
      >
        View Picked Orders
      </button>

      <h4>Available Orders</h4>
      {availableOrders.length === 0 ? (
        <p>No available orders.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Shop</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availableOrders.map(order => (
              <tr key={order._id}>
                <td>{order.shop?.name}</td>
                <td>{order.customer?.name}</td>
                <td>{formatAddress(order.customer?.address)}</td>
                <td>{order.totalAmount.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePickOrder(order)}
                  >
                    Pick Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Picked Orders Modal */}
      {showPickedModal && (
        <PickedOrdersModal
          show={showPickedModal}
          orders={pickedOrders}
          onClose={() => setShowPickedModal(false)}
          refreshOrders={fetchPickedOrders}
        />
      )}
    </div>
  );
}
