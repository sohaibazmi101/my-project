import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Category error:', err));
  }, []);

  useEffect(() => {
    api.get('/products/banners')
      .then(res => setBanners(res.data))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    api.get('/products/featured')
      .then((res) => setFeatured(res.data))
      .catch((err) => console.error('Featured error:', err));
  }, []);

  useEffect(() => {
    api.get('/products/new-arrivals')
      .then(res => setNewArrivals(res.data))
      .catch(err => console.error('Error loading new arrivals:', err));
  }, []);

  // Auto-cycle through banners
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [banners]);

  return (
    <div className="container mt-4">
      {/* Banners Carousel */}
      {banners.length > 0 && (
        <div
          className="mb-5 position-relative"
          onTouchStart={(e) => (window.touchX = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const deltaX = e.changedTouches[0].clientX - window.touchX;
            if (deltaX < -50) {
              setCurrentBanner((prev) => (prev + 1) % banners.length);
            }
          }}
        >
          {/* Carousel Items */}
          <div className="carousel-inner position-relative">
            {banners.map((b, i) => (
              <div
                key={b._id}
                className={`carousel-item ${i === currentBanner ? 'active' : ''}`}
                style={{ display: i === currentBanner ? 'block' : 'none' }}
              >
                <img
                  src={b.imageUrl}
                  className="d-block w-100 img-fluid rounded"
                  alt={b.title || `Banner ${i + 1}`}
                />
                {(b.title || b.description) && (
                  <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-3 rounded">
                    {b.title && <h5>{b.title}</h5>}
                    {b.description && <p>{b.description}</p>}
                  </div>
                )}
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              className="carousel-control-prev"
              style={{ left: '10px', zIndex: 2 }}
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              aria-label="Next banner"
            >
              <span className="carousel-control-prev-icon bg-dark rounded-circle" />
            </button>
            <button
              className="carousel-control-next"
              style={{ right: '10px', zIndex: 2 }}
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              aria-label="Next banner"
            >
              <span className="carousel-control-next-icon bg-dark rounded-circle" />
            </button>
          </div>

          {/* Progress Dots */}
          <div className="d-flex justify-content-center mt-3">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`progress-dot ${i === currentBanner ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      )}


      {/* Featured Products */}
      <h3 className="mb-3">Featured Products</h3>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 mb-5">
        {featured.length > 0 ? (
          featured.map((item) => (
            <div key={item._id} className="col">
              <div className="card h-100 shadow-sm">
                <img
                  src={(item.images && item.images[0]) || 'https://placehold.co/300x200?text=No+Image'}
                  className="card-img-top"
                  alt={item.name}
                  style={{ objectFit: 'cover', height: '200px' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{item.name}</h5>
                  <p className="card-text fw-semibold">₹{item.price}</p>
                  <Link to={`/product/${item._id}`} className="btn btn-sm btn-outline-primary mt-auto">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No featured products yet</p>
        )}
      </div>

      {/* New Arrivals */}
      <h3 className="mb-3">New Arrivals</h3>
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3 mb-5">
        {newArrivals.length > 0 ? (
          newArrivals.map((product) => (
            <div key={product._id} className="col">
              <div className="card h-100 shadow-sm">
                <img
                  src={(product.images && product.images[0]) || 'https://placehold.co/300x200?text=No+Image'}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column text-center">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted">₹{product.price}</p>
                  <Link to={`/product/${product._id}`} className="btn btn-sm btn-outline-primary mt-auto">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No new arrivals yet</p>
        )}
      </div>

      {/* Hero Section */}
      <div className="text-center mb-5 px-3">
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
          <Link to="/shops" className="btn btn-primary btn-lg">Browse Shops</Link>
          <Link to="/register" className="btn btn-outline-secondary btn-lg">Become a Seller</Link>
        </div>
      </div>

      {/* Inline styles for progress dots */}
      <style>{`
        .progress-dot {
          width: 12px;
          height: 4px;
          border-radius: 2px;
          background-color: rgba(0, 0, 0, 0.13);
          margin: 0 4px;
          transition: all 0.3s ease;
        }
        .progress-dot.active {
          width: 48px;
          background-color: black;
        }
          .carousel-control-prev-icon,
          .carousel-control-next-icon {
            background-color: rgba(255, 255, 255, 0.5);
            padding: 10px;
            border-radius: 50%;
          }

      `}</style>
    </div>
  );
}
