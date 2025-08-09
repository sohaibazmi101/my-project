import { useEffect, useState } from 'react';
import ShopCard from '../components/ShopCard';
import api from '../services/api';

export default function ShopList() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/')
      .then((res) => {
        setShops(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching shops:', err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="shoplist-container py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold text-success">
            All Shops in One Place
          </h2>
          <p className="lead text-muted mt-3">
            Explore a wide range of shops and products.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : shops.length === 0 ? (
          <div className="alert alert-info text-center shadow-sm">
            No shops found.
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-md-2 row-cols-lg-3 g-4">
            {shops.map((shop) => (
              <div className="col" key={shop._id}>
                <ShopCard shop={shop} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}