// ConfirmOrderModal.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ErrorModal from '../../components/ErrorModal';

export default function ConfirmOrderModal({
  show,
  onClose,
  product,
  cartItems,
  confirmDetails,
  onConfirmOrder,
}) {
  const emptyDetails = {
    name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '' },
  };

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [editableDetails, setEditableDetails] = useState(confirmDetails || emptyDetails);
  const [customerCoords, setCustomerCoords] = useState({ lat: null, lng: null });
  const [orderSummary, setOrderSummary] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const isCart = Array.isArray(cartItems) && cartItems.length > 0;

  useEffect(() => {
    if (show) {
      setEditableDetails(confirmDetails || emptyDetails);
      setQuantity(1);
      setPaymentMethod('UPI');
      setErrorMessage('');
      setOrderSummary([]);
      setCustomerCoords({ lat: null, lng: null });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setCustomerCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {
            setCustomerCoords({ lat: null, lng: null });
            setErrorMessage('Geolocation access denied. Cannot calculate delivery.');
          }
        );
      } else {
        setCustomerCoords({ lat: null, lng: null });
        setErrorMessage('Geolocation not supported by your browser.');
      }
    }
  }, [show, confirmDetails]);

  useEffect(() => {
    if (show && customerCoords.lat && customerCoords.lng) {
      fetchOrderSummary();
    }
  }, [show, customerCoords, quantity, cartItems, paymentMethod]);

  const fetchOrderSummary = async () => {
    try {
      const payload = isCart
        ? {
          cart: cartItems.map(i => ({ product: i.product._id, quantity: i.quantity })),
          customerLat: customerCoords.lat,
          customerLon: customerCoords.lng,
          paymentMethod
        }
        : {
          productId: product._id,
          quantity,
          customerLat: customerCoords.lat,
          customerLon: customerCoords.lng,
          paymentMethod
        };
      const { data } = await api.post('/customers/calculate-order', payload);
      setOrderSummary(data.orderSummary);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch order summary';
      setErrorMessage(msg);
      setShowErrorModal(true);
    }
  };

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (orderSummary.length === 0) {
      setErrorMessage('Cannot place order: no valid order summary.');
      setShowErrorModal(true);
      return;
    }

    try {
      // Pass the orderSummary and totalAmount to the parent component
      const totalAmount = orderSummary.reduce((sum, shopOrder) => sum + shopOrder.totalAmount, 0);

      const orderData = {
        cart: isCart ? cartItems.map(i => ({ product: i.product._id, quantity: i.quantity })) : [{ product: product._id, quantity }],
        shippingAddress: editableDetails.address,
        customerInfo: {
          name: editableDetails.name,
          email: editableDetails.email,
          phone: editableDetails.phone,
        },
        paymentMethod,
        customerLat: customerCoords.lat,
        customerLon: customerCoords.lng,
        orderSummary, // Pass the orderSummary here
        totalAmount,  // Pass the calculated total amount
      };

      await onConfirmOrder(orderData);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to place order.');
      setShowErrorModal(true);
    }
  };

  return (
    // ... the rest of your modal's JSX remains the same
    <>
      <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content p-4">
            <h4 className="mb-3">Confirm Shipping Details & Payment</h4>

            <form onSubmit={handleSubmit}>
              <input type="text" className="form-control mb-2" placeholder="Name"
                value={editableDetails?.name || ''} onChange={e => setEditableDetails({ ...editableDetails, name: e.target.value })} required />
              <input type="email" className="form-control mb-2" placeholder="Email"
                value={editableDetails?.email || ''} onChange={e => setEditableDetails({ ...editableDetails, email: e.target.value })} required />
              {!isCart && (
                <>
                  <label className="form-label mt-2">Quantity</label>
                  <input type="number" className="form-control mb-2"
                    value={quantity} min="1"
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))} required />
                </>
              )}
              <input type="text" className="form-control mb-2" placeholder="Mobile"
                value={editableDetails?.phone || ''} onChange={e => setEditableDetails({ ...editableDetails, phone: e.target.value })} required />
              <input type="text" className="form-control mb-2" placeholder="Street"
                value={editableDetails?.address?.street || ''} onChange={e => setEditableDetails({ ...editableDetails, address: { ...editableDetails.address, street: e.target.value } })} required />
              <input type="text" className="form-control mb-2" placeholder="City"
                value={editableDetails?.address?.city || ''} onChange={e => setEditableDetails({ ...editableDetails, address: { ...editableDetails.address, city: e.target.value } })} required />
              <input type="text" className="form-control mb-2" placeholder="State"
                value={editableDetails?.address?.state || ''} onChange={e => setEditableDetails({ ...editableDetails, address: { ...editableDetails.address, state: e.target.value } })} required />
              <input type="text" className="form-control mb-3" placeholder="Pincode"
                value={editableDetails?.address?.pincode || ''} onChange={e => setEditableDetails({ ...editableDetails, address: { ...editableDetails.address, pincode: e.target.value } })} required />

              <div className="card mt-3">
                <div className="card-body">
                  <h5 className="card-title">Order Summary</h5>
                  {orderSummary.length === 0 ? (
                    <p>Loading order details...</p>
                  ) : (
                    orderSummary.map(shopOrder => (
                      <div key={shopOrder.shopId} className="mb-3">
                        <h6>{shopOrder.shopName}</h6>
                        <ul className="list-group list-group-flush">
                          {shopOrder.items.map(item => (
                            <li key={item.productId} className="list-group-item d-flex justify-content-between">
                              <span>{item.name} x {item.quantity}</span>
                              <span>₹{item.subtotal.toFixed(2)}</span>
                            </li>
                          ))}
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Distance:</span>
                            <span>{shopOrder.distance.toFixed(2)} km</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            <span>Delivery Charge:</span>
                            <span>₹{shopOrder.deliveryCharge.toFixed(2)}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between">
                            <span>GST:</span>
                            <span>₹{shopOrder.platformFee.toFixed(2)}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span>₹{shopOrder.totalAmount.toFixed(2)}</span>
                          </li>
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-3">
                <label className="form-label">Select Payment Method</label>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="paymentMethod" id="upiRadio" value="UPI"
                    checked={paymentMethod === 'UPI'} onChange={e => setPaymentMethod(e.target.value)} />
                  <label className="form-check-label" htmlFor="upiRadio">UPI</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="paymentMethod" id="codRadio" value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'} onChange={e => setPaymentMethod(e.target.value)} />
                  <label className="form-check-label" htmlFor="codRadio">Cash on Delivery (COD)</label>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-3">
                <button type="submit" className="btn btn-success">Confirm &amp; Buy</button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ErrorModal show={showErrorModal} message={errorMessage} onClose={() => setShowErrorModal(false)} />
    </>
  );
}