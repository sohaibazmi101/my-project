import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminKycDashboard() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentSellerId, setCurrentSellerId] = useState(null);

  // --- Fetch pending sellers from the backend ---
  const fetchPendingSellers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sellers/kyc/pending');
      setPendingSellers(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending KYCs:', err);
      setError('Failed to fetch pending KYCs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  // --- Handle Approve/Reject status update ---
  const handleStatusUpdate = async (sellerId, status, reason = '') => {
    try {
      const res = await api.put(`/sellers/${sellerId}/kyc`, { status, reason });
      alert(res.data.message);
      // Remove the updated seller from the list
      setPendingSellers(pendingSellers.filter(seller => seller._id !== sellerId));
    } catch (err) {
      console.error('Error updating KYC status:', err);
      alert(err.response?.data?.message || 'Failed to update KYC status.');
    } finally {
      setShowModal(false);
      setRejectionReason('');
    }
  };

  // --- Modal functions for rejection ---
  const openRejectModal = (sellerId) => {
    setCurrentSellerId(sellerId);
    setShowModal(true);
  };

  const closeRejectModal = () => {
    setShowModal(false);
    setRejectionReason('');
    setCurrentSellerId(null);
  };

  const submitRejection = () => {
    if (rejectionReason.trim() === '') {
      alert('Rejection reason cannot be empty.');
      return;
    }
    handleStatusUpdate(currentSellerId, 'rejected', rejectionReason);
  };

  // --- Loading, Error, and Empty States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-xl text-gray-700 animate-pulse">Loading pending KYCs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (pendingSellers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
          <p className="text-xl font-semibold text-gray-800">
            <i className="bi bi-check-lg text-green-500 mr-2"></i>
            No pending KYC applications.
          </p>
        </div>
      </div>
    );
  }

  // --- Main Dashboard UI ---
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Admin KYC Dashboard
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Review seller applications and approve or reject their KYC documents.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pendingSellers.map(seller => (
          <div key={seller._id} className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 flex flex-col">
            <h4 className="text-xl font-bold text-gray-800 mb-2">{seller.sellerName}</h4>
            <p className="text-gray-600"><strong>Email:</strong> {seller.email}</p>
            <p className="text-gray-600"><strong>Phone:</strong> {seller.phone}</p>
            <p className="text-gray-600"><strong>Aadhaar:</strong> {seller.aadhaarNumber}</p>
            <p className="text-gray-600"><strong>PAN:</strong> {seller.panNumber}</p>
            <p className="text-gray-600"><strong>Registered:</strong> {new Date(seller.createdAt).toLocaleDateString()}</p>

            <div className="flex space-x-4 mt-4">
              <a href={seller.aadhaarImage} target="_blank" rel="noopener noreferrer"
                 className="flex-1 btn btn-info text-white text-center rounded-lg py-2 transition duration-300 transform hover:scale-105 hover:bg-blue-600">
                <i className="bi bi-file-earmark-person mr-2"></i> View Aadhaar
              </a>
              <a href={seller.panImage} target="_blank" rel="noopener noreferrer"
                 className="flex-1 btn btn-info text-white text-center rounded-lg py-2 transition duration-300 transform hover:scale-105 hover:bg-blue-600">
                <i className="bi bi-file-earmark-font mr-2"></i> View PAN
              </a>
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => handleStatusUpdate(seller._id, 'approved')}
                className="flex-1 btn btn-success text-white rounded-lg py-2 transition duration-300 transform hover:scale-105 hover:bg-green-700">
                <i className="bi bi-check-circle mr-2"></i> Approve
              </button>
              <button
                onClick={() => openRejectModal(seller._id)}
                className="flex-1 btn btn-danger text-white rounded-lg py-2 transition duration-300 transform hover:scale-105 hover:bg-red-700">
                <i className="bi bi-x-circle mr-2"></i> Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Rejection Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h4 className="text-xl font-bold mb-4">Reason for Rejection</h4>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows="4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
            ></textarea>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={closeRejectModal}
                className="btn btn-secondary px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="btn btn-danger px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
