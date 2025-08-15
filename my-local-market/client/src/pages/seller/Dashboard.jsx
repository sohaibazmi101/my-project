import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        setLoading(true);
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
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center p-4 bg-white shadow rounded">
          <p className="h5 text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center p-4 bg-white shadow rounded">
          <p className="h5 text-danger">{error}</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center p-4 bg-white shadow rounded">
          <p className="h5 text-secondary">No seller profile found.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/seller/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const kycStatus = seller.kycStatus;

  if (kycStatus === 'pending' || kycStatus === 'rejected') {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light p-4 text-center">
        {kycStatus === 'pending' ? (
          <>
            <i className="bi bi-hourglass-split text-warning display-1 mb-3"></i>
            <h4 className="fw-bold text-dark">KYC Approval Pending</h4>
            <p className="text-muted fs-5 mx-auto" style={{ maxWidth: '500px' }}>
              Thank you for registering. Your documents are currently being reviewed by our team.
              You will be notified via email once your account is approved.
            </p>
          </>
        ) : (
          <>
            <i className="bi bi-x-circle-fill text-danger display-1 mb-3"></i>
            <h4 className="fw-bold text-dark">KYC Verification Failed</h4>
            <p className="text-muted fs-5 mb-2">
              Unfortunately, your account could not be approved.
            </p>
            {seller.kycRejectedReason && (
              <p className="fst-italic text-danger mx-auto" style={{ maxWidth: '500px' }}>
                Reason: {seller.kycRejectedReason}
              </p>
            )}
          </>
        )}
        <button
          className="btn btn-primary mt-4 px-4"
          onClick={() => navigate('/seller/login')}
        >
          Back to Login
        </button>
      </div>
    );
  }

  // Approved KYC: vertical layout with Bootstrap spacing and buttons
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Welcome, {seller.sellerName}!</h2>
      <p className="text-muted mb-5">
        Your KYC has been approved. Start managing your shop and products here.
      </p>

      <div className="d-flex flex-column gap-4 mx-auto" style={{ maxWidth: '400px' }}>
        <section>
          <h4>Manage Your Orders</h4>
          <p className="text-muted mb-2">View and manage all orders from your customers.</p>
          <button
            className="btn btn-primary w-100"
            onClick={() => navigate('/sellers/orders')}
          >
            Manage Orders
          </button>
        </section>

        <section>
          <h4>Add or Edit Products</h4>
          <p className="text-muted mb-2">Upload new products or update existing ones in your catalog.</p>
          <button
            className="btn btn-primary w-100"
            onClick={() => navigate('/seller/dashboard/add-product')}
          >
            Go to Add Product
          </button>
        </section>

        <section>
          <h4>Manage Your Shop</h4>
          <p className="text-muted mb-2">Customize your shop banner, description, and featured products.</p>
          <button
            className="btn btn-primary w-100"
            onClick={() => navigate('/sellers/me')}
          >
            Go to Shop Settings
          </button>
        </section>

        <section>
          <h4>Manage And Assign Delivery Boys</h4>
          <p className="text-muted mb-2">Customize your shop banner, description, and featured products.</p>
          <button
            className="btn btn-primary w-100"
            onClick={() => navigate('/sellers/manage-db')}
          >
            Manage Delivery Boys
          </button>
        </section>
      </div>
    </div>
  );
}
