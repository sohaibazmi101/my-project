import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import { useCustomer } from '../contexts/CustomerContext';
import { useSeller } from '../contexts/SellerContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {
  FaUserCircle,
  FaSignInAlt,
  FaShoppingCart,
  FaStore,
  FaSignOutAlt,
  FaSun,
  FaMoon
} from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const { customer, logout: customerLogout, loading: customerLoading } = useCustomer();
  const { seller, logout: sellerLogout, loading: sellerLoading } = useSeller();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      closeNavbar();
      setShowSearchModal(false);
    }
  };

  const handleLogout = () => {
    sellerLogout();
    navigate('/');
  };

  const closeNavbar = () => {
    setIsCollapsed(true);
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target) &&
        window.innerWidth < 992
      ) {
        setIsCollapsed(true);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isLoggedIn = !!customer || !!seller;
  const loading = customerLoading || sellerLoading;

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'
          } shadow-sm fixed-top`}
        ref={navRef}
      >

        <div className="container-fluid px-3 px-md-4 d-flex align-items-center justify-content-between">

          {/* Left: Logo + Mobile Search */}
          <div className="d-flex align-items-center">
            <Link className="navbar-brand" to="/" onClick={closeNavbar}>
              <img src={logo} alt="Local Shop" height="40" />
            </Link>

            <button
              className="btn d-lg-none me-2"
              onClick={() => setShowSearchModal(true)}
              aria-label="Open search"
            >
              <img src={searchIcon} alt="Search" height="24" width="24" />
            </button>
          </div>

          {/* Middle: Toggler */}
          <div className="d-flex align-items-center">

            <button
              className="btn btn-outline-secondary me-2"
              onClick={toggleTheme}
              title="Toggle Light/Dark Mode"
            >
              {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            <button
  className="navbar-toggler d-none d-lg-block"
  type="button"
  onClick={() => setIsCollapsed(!isCollapsed)}
  aria-controls="navbarNav"
  aria-expanded={!isCollapsed}
  aria-label="Toggle navigation"
>
  <span className="navbar-toggler-icon" />
</button>

          </div>

          {/* Right: Collapsible Nav */}
          <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
            <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between w-100">

              {/* Desktop Search */}
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
                    <Link className="nav-link" to="/shops" onClick={closeNavbar}>Shops</Link>
                  </li>

                  {customer ? (
                    <>
                      <li className="nav-item me-2">
                        <Link className="nav-link" to="/cart" onClick={closeNavbar}>
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
                            <Link className="dropdown-item" to="/customer/profile" onClick={closeNavbar}>
                              <i className="bi bi-person-circle me-2"></i>
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/customer/orders" onClick={closeNavbar}>
                              <i className="bi bi-receipt me-2"></i>
                              Order History
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/customer/update-profile" onClick={closeNavbar}>
                              <i className="bi bi-pencil-square me-2"></i>
                              Edit Profile
                            </Link>
                          </li>
                          <li>
                            <button className="dropdown-item text-danger" onClick={() => { customerLogout(); closeNavbar(); }}>
                              <i className="bi bi-box-arrow-right me-2"></i>
                              Logout
                            </button>
                          </li>
                        </ul>
                      </li>

                    </>
                  ) : seller ? (

                    <>
                      <li className="nav-item me-2">
                        <Link className="nav-link d-flex align-items-center" to="/dashboard" onClick={closeNavbar}>
                          <FaStore className="me-1" /> <span>Dashboard</span>
                        </Link>
                      </li>

                      <li className="nav-item">
                        <button className="nav-link btn btn-link text-danger d-flex align-items-center" onClick={() => { handleLogout(); closeNavbar(); }}>
                          <FaSignOutAlt className="me-1" /> <span>Logout</span>
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="nav-item me-2">
                        <Link className="nav-link d-flex align-items-center" to="/customer/login" onClick={closeNavbar}>
                          <FaSignInAlt className="me-1" /> <span>Customer Login</span>
                        </Link>
                      </li>

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
                            <Link className="dropdown-item" to="/login" onClick={closeNavbar}>
                              <FaSignInAlt className="me-1" /> Login
                            </Link>
                          </li>
                          <li>
                            <Link className="dropdown-item" to="/register" onClick={closeNavbar}>
                              <FaSignInAlt className="me-1" /> Register
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
