import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin/login');
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
        <h4>🛠 Admin Panel</h4>
        <ul className="nav flex-column mt-4">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/dashboard">🏠 Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/categories">📦 Categories</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/featured">🌟 Featured Products</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/banners">🖼️ Banners</Link>
          </li>
          <li className="nav-item mt-3">
            <button className="btn btn-sm btn-danger w-100" onClick={logout}>Logout</button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}
