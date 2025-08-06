import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ShopDetails() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get(`/shops/${id}`)
      .then(res => {
        setShop(res.data.shop);
        setProducts(res.data.products); // ✅ now correctly populated
      })
      .catch(err => console.error(err));

  }, [id]);

  if (!shop) return <div className="text-center mt-5">Loading...</div>;

  const featured = shop.featuredProducts || [];
  const recent = shop.newProducts || [];

  return (
    <div className="container pt-5 mt-5 mb-5">
      {/* Shop Banner */}
      {shop.banner && (
        <div className="mb-4">
          <img
            src={shop.banner}
            alt={`${shop.name} banner`}
            className="img-fluid rounded"
            style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
          />
        </div>
      )}

      {/* Featured Products Carousel */}
      {featured.length > 0 && (
        <div id="shopFeaturedCarousel" className="carousel slide mb-5" data-bs-ride="carousel" data-bs-interval="2500">
          <div className="d-flex justify-content-between align-items-baseline mb-3">
            <h4 className="mb-0">Our Featured Products</h4>
          </div>

          <div className="carousel-inner">
            {featured.map((item, index) => (
              <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={item._id}>
                <div className="w-100">
                  <div className="card border-0 rounded-0 text-white" style={{ position: 'relative' }}>
                    <img
                      src={(item.images && item.images[0]) || 'https://placehold.co/1200x400?text=No+Image'}
                      className="d-block w-100"
                      alt={item.name}
                      style={{ objectFit: 'cover', height: '400px' }}
                    />
                    <div
                      className="card-img-overlay d-flex flex-column justify-content-end"
                      style={{ background: 'rgba(0,0,0,0.4)' }}
                    >
                      <h4 className="card-title">{item.name}</h4>
                      <p className="card-text fw-semibold">₹{item.price}</p>
                      <Link to={`/product/${item._id}`} className="btn btn-light btn-sm w-auto">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {featured.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#shopFeaturedCarousel"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#shopFeaturedCarousel"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">Next</span>
              </button>
            </>
          )}
        </div>
      )}


      {/* New Arrivals Carousel */}
      {recent.length > 0 && (
        <div id="shopRecentCarousel" className="carousel slide mb-5" data-bs-ride="carousel" data-bs-interval="2500">
          <div className="d-flex justify-content-between align-items-baseline mb-3">
            <h4 className="mb-0">🆕 New Arrivals</h4>
          </div>

          <div className="carousel-inner">
            {recent.map((item, index) => (
              <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={item._id}>
                <div className="w-100">
                  <div className="card border-0 rounded-0 text-white" style={{ position: 'relative' }}>
                    <img
                      src={(item.images && item.images[0]) || 'https://placehold.co/1200x400?text=No+Image'}
                      className="d-block w-100"
                      alt={item.name}
                      style={{ objectFit: 'cover', height: '400px' }}
                    />
                    <div
                      className="card-img-overlay d-flex flex-column justify-content-end"
                      style={{ background: 'rgba(0,0,0,0.4)' }}
                    >
                      <h4 className="card-title">{item.name}</h4>
                      <p className="card-text fw-semibold">₹{item.price}</p>
                      <Link to={`/product/${item._id}`} className="btn btn-light btn-sm w-auto">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recent.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#shopRecentCarousel"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#shopRecentCarousel"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">Next</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Shop Info */}
      <div className="text-center mb-4">
        <h2>{shop.name}</h2>
        {shop.category && <p className="text-muted mb-1">{shop.category}</p>}
        {shop.location && <p className="text-muted mb-1"> {shop.address}</p>}
        {shop.description && <p className="text-muted">{shop.description}</p>}

        {shop.whatsapp && (
          <a
            href={`https://wa.me/${shop.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success btn-sm mt-2"
          >
            Chat with Seller on WhatsApp
          </a>
        )}
      </div>

      {/* All Products */}
      <h4 className="mt-5 mb-3">All Products</h4>
      {products.length === 0 ? (
        <div className="alert alert-info">No products listed yet for this shop.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          {products.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
