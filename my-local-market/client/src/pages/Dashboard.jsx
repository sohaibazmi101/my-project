import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/login');
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Seller Dashboard</h2>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <h4 className="card-title">Add or Edit Products</h4>
              <p className="card-text">Upload new products or update existing ones.</p>
              <button
                className="btn btn-primary mt-auto"
                onClick={() => navigate('/dashboard/add-product')}
              >
                Go to Add Product
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-between">
              <h4 className="card-title">Manage Your Shop</h4>
              <p className="card-text">
                Customize your shop banner, description, and highlight featured or new products.
              </p>
              <button
                className="btn btn-success mt-auto"
                onClick={() => navigate('/dashboard/manage-shop')}
              >
                Go to Shop Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
