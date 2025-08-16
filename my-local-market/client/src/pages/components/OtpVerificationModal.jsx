import React, { useState } from 'react';
import api from '../../services/api';

export default function OtpVerificationModal({ show, email, onVerified, onClose }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/otp/verify-otp', { email, otp });
      onVerified();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4">
          <h5>Email Verification</h5>
          <p>We sent an OTP to <strong>{email}</strong>. Enter it below:</p>
          <input type="text" className="form-control mb-2"
            value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" />
          {error && <p className="text-danger">{error}</p>}
          <div className="d-flex justify-content-between">
            <button className="btn btn-success" onClick={handleVerify} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
