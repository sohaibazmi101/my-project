import React from 'react';

export default function MissingDetailsModal({
  show,
  onClose,
  phone,
  address,
  onMobileChange,
  onAddressChange,
  onSaveAndContinue,
}) {
  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4">
          <h4 className="mb-3">Please Complete Your Details</h4>
          <form onSubmit={onSaveAndContinue}>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Mobile Number"
              value={phone}
              onChange={onMobileChange}
              required
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Street"
              value={address.street}
              onChange={(e) => onAddressChange('street', e.target.value)}
              required
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="City"
              value={address.city}
              onChange={(e) => onAddressChange('city', e.target.value)}
              required
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="State"
              value={address.state}
              onChange={(e) => onAddressChange('state', e.target.value)}
              required
            />
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Pincode"
              value={address.pincode}
              onChange={(e) => onAddressChange('pincode', e.target.value)}
              required
            />
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn btn-primary">
                Save & Continue
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