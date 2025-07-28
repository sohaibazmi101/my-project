import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import { useCustomer } from '../contexts/CustomerContext';
import { useSeller } from '../contexts/SellerContext';
import {
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaShoppingCart,
  FaStore,
  FaSignOutAlt
} from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const { customer, logout: customerLogout, loading: customerLoading } = useCustomer();
  const { seller, logout: logout, loading: sellerLoading } = useSeller();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setIsCollapsed(true);
      setShowSearchModal(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const isLoggedIn = !!customer || !!seller;
  const loading = customerLoading || sellerLoading;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid px-3 px-md-4">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="Local Shop" height="40" />
          </Link>

          {/* Mobile Search Icon */}
          <button
            className="btn d-lg-none me-2"
            onClick={() => setShowSearchModal(true)}
            aria-label="Open search"
          >
            <img src={searchIcon} alt="Search" height="24" width="24" />
          </button>

          {/* Toggler */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-controls="navbarNav"
            aria-expanded={!isCollapsed}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          {/* Collapsible Content */}
          <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between w-100">

              {/* Desktop Search Bar */}
              <form
                onSubmit={handleSearch}
                className="input-group my-2 my-lg-0 mx-lg-auto d-none d-lg-flex"
                style={{ maxWidth: '500px', width: '100%' }}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search shops, categories, products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-outline-primary" type="submit">
                  Search
                </button>
              </form>

              {/* Nav Items */}
              {!loading && (
                <ul className="navbar-nav ms-lg-3 align-items-lg-center mt-2 mt-lg-0">
                  <li className="nav-item">
                    <Link className="nav-link" to="/shops">Shops</Link>
                  </li>

                  {customer ? (
                    <>
                      <li className="nav-item me-2">
                        <Link className="nav-link" to="/cart">
                          <FaShoppingCart size={20} /> Cart
                        </Link>
                      </li>

                      <li className="nav-item dropdown">
                        <button
                          className="nav-link dropdown-toggle btn btn-link"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <FaUserCircle size={20} className="me-1" />
                          {customer.name?.split(' ')[0] || 'Customer'}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <Link className="dropdown-item" to="/customer/profile">
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <button className="dropdown-item text-danger" onClick={customerLogout}>
                              Logout
                            </button>
                          </li>
                        </ul>
                      </li>
                    </>
                  ) : seller ? (
                    <>
                      <li className="nav-item me-2">
                        <Link className="nav-link d-flex align-items-center" to="/dashboard">
                          <FaStore className="me-1" /> <span>Dashboard</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <button className="nav-link btn btn-link text-danger d-flex align-items-center" onClick={handleLogout}>
                          <FaSignOutAlt className="me-1" /> <span>Logout</span>
                        </button>
                      </li>

                    </>
                  ) : (
                    // No one is logged in: show dropdowns
                    <>
                      {/* Customer Dropdown */}
                      <li className="nav-item dropdown me-2">
                        <button
                          className="nav-link dropdown-toggle btn btn-link"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <FaUserCircle className="me-1" /> Customer
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <Link className="dropdown-item" to="/customer/login">
                              <FaSignInAlt className="me-1" /> Login
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/customer/register">
                              <FaUserPlus className="me-1" /> Register
                            </Link>
                          </li>
                        </ul>
                      </li>

                      {/* Seller Dropdown */}
                      <li className="nav-item dropdown">
                        <button
                          className="nav-link dropdown-toggle btn btn-link"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <FaStore className="me-1" /> Seller
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <Link className="dropdown-item" to="/login">
                              <FaSignInAlt className="me-1" /> Login
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/register">
                              <FaUserPlus className="me-1" /> Register
                            </Link>
                          </li>
                        </ul>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      {showSearchModal && (
        <div className="modal show d-block" tabIndex="-1" onClick={() => setShowSearchModal(false)}>
          <div className="modal-dialog modal-fullscreen-sm-down" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Search</h5>
                <button type="button" className="btn-close" onClick={() => setShowSearchModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSearch}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search shops, categories, products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoFocus
                    />
                    <button className="btn btn-primary" type="submit">
                      Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
