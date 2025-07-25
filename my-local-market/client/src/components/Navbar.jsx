import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');
  const seller = JSON.parse(localStorage.getItem('seller') || '{}');
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid px-3 px-md-4">
        <Link className="navbar-brand fw-bold" to="/">
          🏪 Local Shop
        </Link>

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

        <div className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center mt-3 mt-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/shops">
                Shops
              </Link>
            </li>

            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="nav-link text-muted">
                    Hi, {seller.name?.split(' ')[0] || 'Seller'}
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-danger ms-lg-2 mt-2 mt-lg-0" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
