import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://my-local-project.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default function AdminKycDashboard() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sellers/kyc/pending');
      setPendingSellers(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending KYCs:', err);
      setError('Failed to fetch pending KYCs.');
      setNotification({ message: 'Failed to fetch pending KYCs.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const handleStatusUpdate = async (sellerId, status) => {
    try {
      const res = await api.put(`/sellers/${sellerId}/kyc`, { status });
      setNotification({ message: res.data.message, type: 'success' });
      setPendingSellers((prev) => prev.filter((seller) => seller._id !== sellerId));
    } catch (err) {
      console.error('Error updating KYC status:', err);
      setNotification({
        message: err.response?.data?.message || 'Failed to update KYC status.',
        type: 'danger',
      });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <p className="fs-4 text-muted">Loading pending KYCs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <p className="fs-4 text-danger">{error}</p>
      </div>
    );
  }

  if (pendingSellers.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <p className="fs-5 fw-semibold text-dark">
          <i className="bi bi-check-lg text-success me-2"></i>
          No pending KYC applications.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Admin KYC Dashboard</h2>

      {notification.message && (
        <div className={`alert alert-${notification.type}`} role="alert">
          {notification.message}
        </div>
      )}

      <div className="table-responsive shadow rounded bg-white">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-primary">
            <tr>
              <th>Seller Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Aadhaar No.</th>
              <th>PAN No.</th>
              <th>Address</th>
              <th>Registered</th>
              <th>Documents</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingSellers.map((seller) => (
              <tr key={seller._id}>
                <td>{seller.sellerName}</td>
                <td>{seller.email}</td>
                <td>{seller.phone}</td>
                <td>{seller.aadhaarNumber}</td>
                <td>{seller.panNumber}</td>
                <td>{seller.address}</td>
                <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                <td>
                  <a
                    href={seller.aadhaarImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm w-100 mb-2"
                  >
                    Aadhaar
                  </a>
                  <a
                    href={seller.panImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm w-100"
                  >
                    PAN
                  </a>
                </td>
                <td>
                  <button
                    onClick={() => handleStatusUpdate(seller._id, 'approved')}
                    className="btn btn-primary btn-sm w-100 mb-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(seller._id, 'rejected')}
                    className="btn btn-danger btn-sm w-100"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
