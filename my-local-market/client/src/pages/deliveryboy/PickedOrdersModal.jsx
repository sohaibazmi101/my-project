import { useState } from 'react';
import SecretCodeModal from './SecretCodeModal';
import api from '../../services/api';

export default function PickedOrdersModal({ show, orders, onClose, refreshOrders }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionType, setActionType] = useState('');
    const [showSecretModal, setShowSecretModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);

    const handleActionClick = (order, type) => {
        setSelectedOrder(order);
        setActionType(type);
        setShowSecretModal(true);
    };

    const handleSecretSubmit = async (code) => {
        try {
            await api.patch(
                `/delivery-boy/${selectedOrder._id}/status`,
                { action: actionType, secretCode: code },
                { headers: { Authorization: `Bearer ${localStorage.getItem('deliveryToken')}` } }
            );

            setShowSecretModal(false);
            refreshOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid code or server error');
        }
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        const parts = [address.street, address.city, address.state, address.pincode].filter(Boolean);
        return parts.join(', ');
    };

    const handleDirectionsClick = (order, e) => {
        if (!order.customerLocation?.lat || !order.customerLocation?.lon) {
            e.preventDefault(); // prevent opening link
            setShowLocationModal(true);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Picked Orders</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {orders.length === 0 ? (
                            <p>No picked orders.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th>Shop</th>
                                            <th>Customer</th>
                                            <th>Phone</th>
                                            <th>Address</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td>{order.shop?.name}</td>
                                                <td>{order.customer?.name}</td>
                                                <td>{order.customer?.phone || 'N/A'}</td>
                                                <td>
                                                    {formatAddress(order.customer?.address)}{' '}
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.customerLocation?.lat},${order.customerLocation?.lon}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`btn btn-info btn-sm ${!order.customerLocation?.lat ? 'disabled' : ''}`}
                                                        onClick={(e) => {
                                                            if (!order.customerLocation?.lat) e.preventDefault();
                                                        }}
                                                    >
                                                        Directions
                                                    </a>
                                                </td>
                                                <td>{order.totalAmount.toFixed(2)}</td>
                                                <td>{order.status}</td>
                                                <td>{order.paymentStatus}</td>
                                                <td>
                                                    {order.status === 'PickedUp' && (
                                                        <>
                                                            <button
                                                                className="btn btn-success btn-sm me-2"
                                                                onClick={() => handleActionClick(order, 'Delivered')}
                                                            >
                                                                Delivered
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleActionClick(order, 'Cancelled')}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        )}
                    </div>
                </div>

                {/* Secret Code Modal */}
                {selectedOrder && showSecretModal && (
                    <SecretCodeModal
                        show={showSecretModal}
                        secretCode={selectedOrder.secretCode}
                        onClose={() => setShowSecretModal(false)}
                        onSubmit={handleSecretSubmit}
                        actionType={actionType}
                    />
                )}

                {/* Location Not Available Modal */}
                {showLocationModal && (
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Location Not Available</h5>
                                    <button className="btn-close" onClick={() => setShowLocationModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>The customer's location data is not available.</p>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowLocationModal(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
