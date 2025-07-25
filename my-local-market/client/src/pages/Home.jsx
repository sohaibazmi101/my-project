import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';


export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [banners, setBanners] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="container mt-4">

      {/* 🔍 Search Bar */}
      <form onSubmit={handleSearch} className="input-group mb-5 px-2 px-md-0">
        <input
          type="text"
          className="form-control"
          placeholder="Search for shops, categories or products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline-primary" type="submit">Search</button>
      </form>

      {/* 🎯 Hero Section */}
      <div className="text-center mb-5 px-3">
        <h1 className="fw-bold">🛍️ Welcome to Local Shop</h1>
        <p className="lead">Discover and shop from verified local stores near you.</p>
        <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
          <Link to="/shops" className="btn btn-primary btn-lg">Browse Shops</Link>
          <Link to="/register" className="btn btn-outline-secondary btn-lg">Become a Seller</Link>
        </div>
      </div>

      {/* 🔁 Banners Carousel */}
      {banners.length > 0 && (
        <div className="mb-5">
          <div id="bannerCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {banners.map((b, i) => (
                <div key={b._id} className={`carousel-item ${i === 0 ? 'active' : ''}`}>
                  <img src={b.imageUrl} className="d-block w-100 img-fluid rounded" alt={b.title || `Banner ${i + 1}`} />
                  {(b.title || b.description) && (
                    <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-3 rounded">
                      {b.title && <h5>{b.title}</h5>}
                      {b.description && <p>{b.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" />
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" />
            </button>
          </div>
        </div>
      )}

      {/* 🌟 Featured Products */}
      <h3 className="mb-3">🌟 Featured Products</h3>
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


      {/* 📦 Categories */}
      <h3 className="mb-3">🆕 New Arrivals</h3>
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

    </div>
  );
}
