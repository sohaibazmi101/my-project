import { Link } from 'react-router-dom';

export default function DashboardHome() {
  return (
    <div className="pt-5">
      <h2>Welcome Admin 👋</h2>
      <p>Select an option from the sidebar to manage the website.</p>

      <div className="mt-4">
        <h5>Quick Links:</h5>
        <div className="d-flex flex-wrap gap-3">
          <Link to="/admin/dashboard" className="btn btn-primary">
            🏠 Dashboard
          </Link>
          <Link to="/admin/categories" className="btn btn-success">
            📦 Categories
          </Link>
          <Link to="/admin/featured" className="btn btn-warning text-dark">
            🌟 Featured Products
          </Link>
          <Link to="/admin/banners" className="btn btn-info text-dark">
            🖼️ Banners
          </Link>
          <Link to="/admin/manage-offers" className="btn btn-danger">
            🎁 Manage Offers
          </Link>
        </div>
      </div>
    </div>
  );
}
