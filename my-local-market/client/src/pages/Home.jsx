import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SmallProductCard from '../components/SmallProductCard';
import CategoryCard from '../components/CategoryCard';
import ShopCard from '../components/ShopCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const navigate = useNavigate();
  const [bestSellers, setBestSellers] = useState([]);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };


  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch((err) => console.error('Category error:', err));
    api.get('/products/banners').then(res => setBanners(res.data)).catch(() => setBanners([]));
    api.get('/products/featured').then((res) => setFeatured(res.data)).catch((err) => console.error('Featured error:', err));
    api.get('/products/new-arrivals').then(res => setNewArrivals(res.data)).catch(err => console.error('Error loading new arrivals:', err));
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    api.get('/')
      .then((res) => {
        setBestSellers(res.data.slice(0, 10));
      })
      .catch((err) => {
        console.error('Error fetching best sellers:', err.message);
      });
  }, []);


  return (
    <div className="container-fluid pt-5 mt-4">
      {/* Blue Section with Heading, Paragraph, Search Bar, and Banners Carousel */}
      <div
        className="container-fluid"
        style={{
          background: 'linear-gradient(to bottom, #05213fff, #0b77e2ff)',
          color: 'white',
          paddingTop: '20px',
          paddingBottom: '15px'
        }}
      >
        {/* Heading and Paragraph */}
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-3">Shop more. Spend less.</h2>
          <p className="mb-4 fs-8">From our store to your door — with love.</p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="input-group mx-auto"
            style={{ maxWidth: '500px', width: '100%' }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Search shops, categories, products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-outline-light" type="submit">
              Search
            </button>
          </form>
        </div>

        {/* Banners Carousel */}
        {banners.length > 0 && (
          <div
            className="mb-4 position-relative"
            onTouchStart={(e) => (window.touchX = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const deltaX = e.changedTouches[0].clientX - window.touchX;
              if (deltaX < -50) setCurrentBanner((prev) => (prev + 1) % banners.length);
            }}
          >
            <div className="carousel-inner position-relative">
              {banners.map((b, i) => (
                <div key={b._id} className={`carousel-item ${i === currentBanner ? 'active' : ''}`}>
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

              {/* Navigation */}
              <button
                className="carousel-control-prev"
                style={{ left: '10px', zIndex: 2 }}
                onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              >
                <span className="carousel-control-prev-icon bg-dark rounded-circle" />
              </button>
              <button
                className="carousel-control-next"
                style={{ right: '10px', zIndex: 2 }}
                onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              >
                <span className="carousel-control-next-icon bg-dark rounded-circle" />
              </button>
            </div>

            {/* Progress Dots */}
            <div className="d-flex justify-content-center mt-2">
              {banners.map((_, i) => (
                <div key={i} className={`progress-dot ${i === currentBanner ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Top Sellers / Categories */}
      <div className="mb-2" style={{ marginTop: '5px' }}>
        <h5 style={{ marginBottom: '6px' }}>Top Sellers</h5>
        {categories.length > 0 && (
          <div
            className="scroll-container d-flex hide-scroll"
            style={{
              gap: '0.5rem',
              overflowX: 'auto',
              overflowY: 'hidden',
            }}
          >
            {categories.map((cat) => (
              <div key={cat._id} style={{ flex: '0 0 auto' }}>
                <CategoryCard category={cat} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Featured */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #5be87cff, #f6fff8)', // Light green → lighter green
          borderRadius: '8px',
          padding: '1rem',
          paddingBottom: '0.5rem'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Top Featured</h5>
          <Link
            to="/featured"
            className="text-primary text-decoration-none d-flex align-items-center"
            style={{ fontSize: '0.9rem' }}
          >
            See all <i className="ms-1 bi bi-arrow-right" />
          </Link>
        </div>

        <div
          className="scroll-container pb-1 d-flex hide-scroll"
          style={{
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
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
      </div>

      {/* New Arrivals */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #50ef75ff, #f6fff8)',
          borderRadius: '8px',
          padding: '1rem',
          paddingBottom: '0.5rem'
        }}
      >
        <h5 className="mb-2">New Arrivals</h5>
        <div
          className="scroll-container pb-1 d-flex hide-scroll"
          style={{
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}
        >
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
      </div>

      {/* Best Sellers */}
      <div
        style={{
          background: 'linear-gradient(to bottom, #4fed74ff, #f6fff8)',
          borderRadius: '8px',
          padding: '1rem',
          paddingBottom: '0.5rem'
        }}
      >
        <h5 className="mb-2">Best Sellers</h5>
        <div
          className="scroll-container pb-1 d-flex hide-scroll"
          style={{
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}
        >
          {bestSellers.length > 0 ? (
            bestSellers.map((shop) => (
              <div key={shop._id} style={{ flex: '0 0 auto' }}>
                <ShopCard shop={shop} />
              </div>
            ))
          ) : (
            <p>No best sellers yet</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mb-4 px-3">
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
          <Link to="/login" className="btn btn-primary btn-lg">Seller Login</Link>
          <Link to="/register" className="btn btn-outline-secondary btn-lg">Become a Seller</Link>
        </div>
      </div>

      {/* Inline styles */}
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

        .hide-scroll {
          scrollbar-width: none;       /* Firefox */
          -ms-overflow-style: none;    /* IE and Edge */
        }

        .hide-scroll::-webkit-scrollbar {
          display: none;               /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}
