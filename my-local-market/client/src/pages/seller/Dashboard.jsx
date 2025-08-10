import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
// No longer importing react-icons, using Bootstrap Icons instead

export default function Dashboard() {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the seller's profile to get the KYC status
    const fetchSellerProfile = async () => {
      try {
        setLoading(true);
        // The API call to get the seller's profile
        const res = await api.get('/sellers/me');
        setSeller(res.data.seller);
        setError(null);
      } catch (err) {
        console.error('Error fetching seller profile:', err);
        setError('Failed to fetch profile. Please try again later.');
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Display a loading message while the data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <p className="text-lg font-semibold text-gray-700 animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Display an error message if the API call failed
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <p className="text-lg font-semibold text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Handle the case where the seller object is not available
  if (!seller) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <p className="text-lg font-semibold text-gray-700">
            No seller profile found.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => navigate('/seller/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render different UI based on the seller's KYC status
  const kycStatus = seller.kycStatus;

  // --- UI for PENDING or REJECTED KYC ---
  if (kycStatus === 'pending' || kycStatus === 'rejected') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-xl w-full text-center">
          {kycStatus === 'pending' ? (
            <>
              <i className="bi bi-hourglass-split text-yellow-500 text-6xl mb-4 mx-auto"></i>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">KYC Approval Pending</h4>
              <p className="text-gray-600 text-lg">
                Thank you for registering. Your documents are currently being reviewed by our team.
                You will be notified via email once your account is approved.
              </p>
            </>
          ) : (
            <>
              <i className="bi bi-x-circle-fill text-red-500 text-6xl mb-4 mx-auto"></i>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">KYC Verification Failed</h4>
              <p className="text-gray-600 text-lg mb-2">
                Unfortunately, your account could not be approved.
              </p>
              {seller.kycRejectedReason && (
                <p className="text-sm italic text-red-400">
                  Reason: {seller.kycRejectedReason}
                </p>
              )}
            </>
          )}
          <div className="mt-6">
            <button
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
              onClick={() => navigate('/seller/login')}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- UI for APPROVED KYC (full dashboard) ---
  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex items-center mb-6">
        <i className="bi bi-check-circle-fill text-green-500 text-3xl mr-3"></i>
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome, {seller.sellerName}!
        </h2>
      </div>
      <p className="text-gray-600 mb-8">
        Your KYC has been approved. Start managing your shop and products here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Manage Orders Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Manage Your Orders</h4>
            <p className="text-gray-600 mb-4">View and manage all orders from your customers.</p>
          </div>
          <button
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
            onClick={() => navigate('/sellers/orders')}
          >
            Manage Orders
          </button>
        </div>

        {/* Add/Edit Products Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Add or Edit Products</h4>
            <p className="text-gray-600 mb-4">Upload new products or update existing ones in your catalog.</p>
          </div>
          <button
            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-300"
            onClick={() => navigate('/seller/dashboard/add-product')}
          >
            Go to Add Product
          </button>
        </div>

        {/* Manage Shop Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Manage Your Shop</h4>
            <p className="text-gray-600 mb-4">Customize your shop banner, description, and featured products.</p>
          </div>
          <button
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300"
            onClick={() => navigate('/sellers/me')}
          >
            Go to Shop Settings
          </button>
        </div>
      </div>
    </div>
  );
}
