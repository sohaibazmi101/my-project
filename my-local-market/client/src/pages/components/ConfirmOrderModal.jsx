import React, { useState, useEffect } from 'react';

export default function ConfirmOrderModal({
  show,
  onClose,
  product, // single product object or null for cart
  cartItems, // array of cart items (optional)
  confirmDetails,
  onConfirmOrder,
  totalAmount: cartTotalAmount, // total amount for cart (optional)
}) {
  const emptyDetails = {
    name: '',
    email: '',
    mobile: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
  };

  // Manage quantity & paymentMethod internally (default 1 and 'cod')
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [editableDetails, setEditableDetails] = useState(confirmDetails || emptyDetails);

  useEffect(() => {
    if (show) {
      setEditableDetails(confirmDetails || emptyDetails);
      setQuantity(1);
      setPaymentMethod('Cash on Delivery');
    }
  }, [show, confirmDetails]);

  // Determine if handling cart or single product
  const isCart = Array.isArray(cartItems) && cartItems.length > 0;

  // Calculate total amount
  const totalAmount = isCart
    ? cartTotalAmount
    : product?.price * quantity || 0;

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const orderData = {
      cart: isCart
        ? cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          paymentMethod: paymentMethod,
        }))
        : [
          {
            product: product._id,
            quantity: quantity,
            paymentMethod: paymentMethod,
          },
        ],
      totalAmount,
      shippingAddress: editableDetails.address,
      customerInfo: {
        name: editableDetails.name,
        email: editableDetails.email,
        mobile: editableDetails.mobile,
      },
    };

    onConfirmOrder(orderData);
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content p-4">
          <h4 className="mb-3">Confirm Shipping Details & Payment</h4>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control mb-2"
              value={editableDetails?.name || ''}
              onChange={(e) =>
                setEditableDetails({ ...editableDetails, name: e.target.value })
              }
              placeholder="Name"
              required
            />
            <input
              type="email"
              className="form-control mb-2"
              value={editableDetails?.email || ''}
              onChange={(e) =>
                setEditableDetails({ ...editableDetails, email: e.target.value })
              }
              placeholder="Email"
              required
            />

            {/* Quantity input only for single product */}
            {!isCart && (
              <>
                <label className="form-label mt-2">Quantity</label>
                <input
                  type="number"
                  className="form-control mb-2"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setQuantity(isNaN(value) || value < 1 ? 1 : value);
                  }}
                  min="1"
                  required
                />
              </>
            )}

            <input
              type="text"
              className="form-control mb-2"
              placeholder="Mobile"
              value={editableDetails?.mobile || ''}
              onChange={(e) =>
                setEditableDetails({ ...editableDetails, mobile: e.target.value })
              }
              required
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Street"
              value={editableDetails?.address?.street || ''}
              onChange={(e) =>
                setEditableDetails({
                  ...editableDetails,
                  address: { ...editableDetails.address, street: e.target.value },
                })
              }
              required
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="City"
              value={editableDetails?.address?.city || ''}
              onChange={(e) =>
                setEditableDetails({
                  ...editableDetails,
                  address: { ...editableDetails.address, city: e.target.value },
                })
              }
              required
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="State"
              value={editableDetails?.address?.state || ''}
              onChange={(e) =>
                setEditableDetails({
                  ...editableDetails,
                  address: { ...editableDetails.address, state: e.target.value },
                })
              }
              required
            />
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Pincode"
              value={editableDetails?.address?.pincode || ''}
              onChange={(e) =>
                setEditableDetails({
                  ...editableDetails,
                  address: { ...editableDetails.address, pincode: e.target.value },
                })
              }
              required
            />

            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Order Summary</h5>
                <ul className="list-group list-group-flush">
                  {isCart ? (
                    cartItems.map((item) => (
                      <li
                        key={item.product._id}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <span>
                          {item.product.name} x {item.quantity}
                        </span>
                        <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Product Price:</span>
                        <span>₹{product?.price.toFixed(2)}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Quantity:</span>
                        <span>{quantity}</span>
                      </li>
                    </>
                  )}
                  <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-3">
              <label className="form-label">Select Payment Method</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="upiRadio"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="upiRadio">
                  UPI
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="codRadio"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="codRadio">
                  Cash on Delivery (COD)
                </label>
              </div>

            </div>

            <div className="d-flex justify-content-between mt-3">
              <button type="submit" className="btn btn-success">
                Confirm & Buy
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
