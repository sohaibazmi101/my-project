import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import { useCustomer } from '../contexts/CustomerContext';
import { FaUserCircle, FaSignInAlt, FaUserPlus, FaShoppingCart } from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const { customer, logout } = useCustomer();
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

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid px-3 px-md-4">

          {/* Logo */}
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
              <ul className="navbar-nav ms-lg-3 align-items-lg-center mt-2 mt-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" to="/shops">Shops</Link>
                </li>

                {customer ? (
                  <>
                    {/* Cart */}
                    <li className="nav-item me-2">
                      <Link className="nav-link" to="/cart">
                        <FaShoppingCart size={20} /> Cart
                      </Link>
                    </li>

                    {/* Customer Dropdown */}
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <FaUserCircle size={20} className="me-1" />
                        {customer.name?.split(' ')[0] || 'Customer'}
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <Link className="dropdown-item" to="/customer-profile">
                            My Profile
                          </Link>
                        </li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={logout}>
                            Logout
                          </button>
                        </li>
                      </ul>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item me-2">
                      <Link className="nav-link" to="/customer-login">
                        <FaSignInAlt className="me-1" /> Login
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/customer-register">
                        <FaUserPlus className="me-1" /> Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal for Mobile */}
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
