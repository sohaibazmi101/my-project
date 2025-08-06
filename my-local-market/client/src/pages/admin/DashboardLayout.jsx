import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="d-flex flex-column flex-lg-row min-vh-100">
      {/* Mobile Header */}
      <div className="d-flex d-lg-none justify-content-between align-items-center bg-dark text-white p-3">
        <h4 className="mb-0">🛠 Admin Panel</h4>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-dark text-white p-3 ${
          sidebarOpen ? 'd-block' : 'd-none'
        } d-lg-block`}
        style={{ width: '100%', maxWidth: '250px' }}
      >
        <h4 className="text-center text-lg-start d-none d-lg-block">🛠 Admin Panel</h4>
        <ul className="nav flex-column mt-3 mt-lg-4 text-center text-lg-start">
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>🏠 Dashboard</Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/admin/categories" onClick={() => setSidebarOpen(false)}>📦 Categories</Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/admin/featured" onClick={() => setSidebarOpen(false)}>🌟 Featured Products</Link>
          </li>
          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/admin/banners" onClick={() => setSidebarOpen(false)}>🖼️ Banners</Link>
          </li>
          <li className="nav-item mt-3">
            <button className="btn btn-sm btn-danger w-100" onClick={logout}>Logout</button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-3 p-md-4 bg-light">
        <Outlet />
      </div>
    </div>
  );
}
