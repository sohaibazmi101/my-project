import { useState } from 'react';
import api from '../../services/api';

export default function UpdateOrderModal({ show, order, onClose, refreshOrders }) {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [secretCode, setSecretCode] = useState('');

  const token = localStorage.getItem('deliveryBoyToken');

  const handleUpdate = async () => {
    try {
      await api.patch(`/delivery-boy/orders/${order._id}/update`, {
        status,
        paymentStatus,
        secretCode,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Order updated successfully');
      refreshOrders();
      onClose();
    } catch (err) {
      console.error('Failed to update order:', err);
      alert(err.response?.data?.message || 'Failed to update order');
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-content p-3">
          <h5>Update Order</h5>

          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-control mb-2">
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

          <label>Payment Status</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="form-control mb-2">
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <label>Secret Code</label>
          <input
            type="text"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            className="form-control mb-2"
          />

          <button className="btn btn-success me-2" onClick={handleUpdate}>Update</button>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
