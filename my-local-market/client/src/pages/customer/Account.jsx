import { Link, useNavigate } from 'react-router-dom';
import { useCustomer } from "../../contexts/CustomerContext";
import {
    FaFileAlt,
    FaShieldAlt,
    FaQuestionCircle,
    FaInfoCircle,
    FaChevronRight,
    FaStore,
    FaSignInAlt,
    FaBoxOpen,
    FaUser,
    FaUndo,
    FaUserEdit,
    FaSignOutAlt,
    FaTachometerAlt,
    FaShippingFast  // add this line
} from 'react-icons/fa';

import SmallProductCard from '../../components/SmallProductCard';

export default function Account() {
    const { customer, recentlyViewed } = useCustomer();
    const navigate = useNavigate();
    const sellerToken = localStorage.getItem('token');

    const cardStyle = {
        backgroundColor: 'var(--bs-body-bg)',
        color: 'var(--bs-body-color)',
        border: '1px solid var(--bs-border-color, #dee2e6)',
        borderRadius: '0.5rem',
    };

    const linkStyle = {
        padding: '12px 0',
        textDecoration: 'none',
        color: 'inherit',
        borderTop: '1px solid var(--bs-border-color, #ccc)'
    };

    const handleSellerLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="container-fluid py-3">
            {/* Login Prompt */}
            {!customer && !sellerToken && (
                <div className="mb-4 p-3" style={cardStyle}>
                    <h4 className="mb-3">Account</h4>
                    <div className="d-flex align-items-center justify-content-between">
                        <p className="mb-0">Log in to get connected with us</p>
                        <button className="btn btn-primary" onClick={() => navigate('/customer/login')}>
                            Log In
                        </button>
                    </div>
                </div>
            )}

            {/* Logged In Features for Customer */}
            {customer && (
                <>
                    {/* Orders Box */}
                    <div className="mb-4 p-3" style={cardStyle}>
                        <h5 className="mb-3">Your Orders</h5>
                        <Link
                            to="/customer/orders"
                            className="d-flex align-items-center justify-content-between py-2"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaBoxOpen className="me-2 text-warning" />
                                <span>View Order History</span>
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </div>

                    {/* Recently Viewed */}
                    {recentlyViewed && recentlyViewed.length > 0 && (
                        <div className="mb-4 p-3" style={cardStyle}>
                            <h5 className="mb-3">Recently Viewed</h5>
                            <div className="d-flex overflow-auto" style={{ gap: '12px' }}>
                                {recentlyViewed.map((product) => (
                                    <SmallProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Account Settings */}
                    <div className="mb-4 p-3" style={cardStyle}>
                        <h5 className="mb-3">Account Settings</h5>

                        <Link
                            to="/customer/profile"
                            className="d-flex align-items-center justify-content-between py-2"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaUser className="me-2 text-primary" />
                                <span>My Profile</span>
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>

                        <Link
                            to="/customer/update-profile"
                            className="d-flex align-items-center justify-content-between py-2 border-top"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaUserEdit className="me-2 text-success" />
                                <span>Edit Profile</span>
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </div>
                </>
            )}

            {/* Earn With Us or Seller Dashboard */}
            <div className="mb-4 p-3" style={cardStyle}>
                <h5 className="mb-3">Earn With Us</h5>

                {!sellerToken ? (
                    <>
                        <Link
                            to="/register"
                            className="d-flex align-items-center justify-content-between py-2"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaStore className="me-2 text-danger" />
                                <span>Sell on HarCheezNow</span>
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>

                        <Link
                            to="/seller/login"
                            className="d-flex align-items-center justify-content-between py-2 border-top"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="d-flex align-items-center">
                                <FaSignInAlt className="me-2 text-primary" />
                                <span>Seller Login</span>
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/seller/dashboard')}
                            className="btn btn-outline-dark w-100 mb-2 d-flex align-items-center justify-content-center"
                        >
                            <FaTachometerAlt className="me-2" />
                            Go to Seller Dashboard
                        </button>
                        <button
                            onClick={handleSellerLogout}
                            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                            style={{ borderRadius: '0.5rem' }}
                        >
                            <FaSignOutAlt className="me-2" />
                            Logout
                        </button>
                    </>
                )}
            </div>

            {/* Feedback & Info */}
            <div className="mb-4 p-3" style={cardStyle}>
                <h5 className="mb-3">Feedback & Information</h5>
                <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                        <Link to="/terms" className="d-flex justify-content-between align-items-center p-2 rounded" style={linkStyle}>
                            <div className="d-flex align-items-center">
                                <FaFileAlt className="me-2 text-primary" />
                                Terms & Conditions
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link to="/privacy" className="d-flex justify-content-between align-items-center p-2 rounded" style={linkStyle}>
                            <div className="d-flex align-items-center">
                                <FaShieldAlt className="me-2 text-success" />
                                Privacy Policy
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </li>

                    <li className="mb-2">
                        <Link to="/refund" className="d-flex justify-content-between align-items-center p-2 rounded" style={linkStyle}>
                            <div className="d-flex align-items-center">
                                <FaUndo className="me-2 text-info" />
                                Cancellation and Refund
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </li>

                    <li className="mb-2">
                        <Link to="/shipping" className="d-flex justify-content-between align-items-center p-2 rounded" style={linkStyle}>
                            <div className="d-flex align-items-center">
                                <FaShippingFast className="me-2 text-info" />
                                Shipping and Delivery
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </li>

                    <li className="mb-2">
                        <Link to="/help" className="d-flex justify-content-between align-items-center p-2 rounded" style={linkStyle}>
                            <div className="d-flex align-items-center">
                                <FaQuestionCircle className="me-2 text-warning" />
                                Help & Support
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link to="/about" className="d-flex justify-content-between align-items-center p-2 rounded" style={linkStyle}>
                            <div className="d-flex align-items-center">
                                <FaInfoCircle className="me-2 text-info" />
                                About Us
                            </div>
                            <FaChevronRight className="text-muted" />
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}
