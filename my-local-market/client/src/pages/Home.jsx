import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SmallProductCard from '../components/SmallProductCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const navigate = useNavigate();
  const [showNotice, setShowNotice] = useState(true);

  useEffect(() => {
    setShowNotice(true);
  }, []);

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
    <div className="container-fluid pt-5 mt-4">
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

      {/* Category Cards Section */}
      {categories.length > 0 && (
        <div className="d-flex overflow-auto mb-4 pb-2" style={{ gap: '0.5rem' }}>
          {categories.map((cat) => (
            <div key={cat._id} style={{ flex: '0 0 auto' }}>
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>
      )}

      {/* Featured Section */}
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-2 mb-md-0">Top Featured</h5>
        <Link
          to="/featured"
          className="text-primary text-decoration-none d-flex align-items-center"
          style={{ fontSize: '0.9rem' }}
        >
          See all <i className="ms-1 bi bi-arrow-right"></i>
        </Link>
      </div>

      <div className="d-flex overflow-auto mb-4 pb-2" style={{ gap: '0.5rem' }}>
        {featured.length > 0 ? (
          featured.map((product) => (
            <div key={product._id} style={{ flex: '0 0 auto' }}>
              <SmallProductCard product={product} quantity={1} showQuantity={false} />
            </div>
          ))
        ) : (
          <p>No Featured</p>
        )}
      </div>


      {/* New Arrivals */}
      <h5 className="mb-2">New Arrivals</h5>
      <div className="d-flex overflow-auto mb-4 pb-2" style={{ gap: '0.5rem' }}>
        {newArrivals.length > 0 ? (
          newArrivals.map((product) => (
            <div key={product._id} style={{ flex: '0 0 auto' }}>
              <SmallProductCard product={product} quantity={1} showQuantity={false} />
            </div>
          ))
        ) : (
          <p>No new arrivals yet</p>
        )}
      </div>
      {/* Hero Section */}
      <div className="text-center mb-5 px-3">
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
          <Link to="/login" className="btn btn-primary btn-lg">Seller Login</Link>
          <Link to="/register" className="btn btn-outline-secondary btn-lg">Become a Seller</Link>
        </div>
      </div>

      {/* Bootstrap Modal for Test Warning */}
      {/* {showNotice && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">🧪 Test Deployment</h5>
                <button type="button" className="btn-close" onClick={() => setShowNotice(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  This site is deployed for <strong>testing purposes</strong> only.<br />
                  Any accounts or orders you create may be deleted at any time.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-warning" onClick={() => setShowNotice(false)}>
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}


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
            .scroll-container::-webkit-scrollbar {
              height: 8px;
            }

            .scroll-container::-webkit-scrollbar-thumb {
              background-color: #888;
              border-radius: 4px;
            }

            .scroll-container::-webkit-scrollbar-thumb:hover {
              background-color: #555;
            }


      `}</style>
    </div>
  );
}