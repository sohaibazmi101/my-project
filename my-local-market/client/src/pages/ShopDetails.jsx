import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import SmallProductCard from '../components/SmallProductCard';

export default function ShopDetails() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    api.get(`/shops/${id}`)
      .then(res => {
        setShop(res.data.shop);
        setProducts(res.data.products);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!shop) return <div className="text-center mt-5">Loading...</div>;

  // Safely get category name (if categories and shop.category exist)
  const categoryName = (shop.category && categories.length > 0)
    ? (categories.find(cat => cat._id.toString() === shop.category.toString())?.name || 'Unknown Category')
    : 'Loading category...';

  const featured = shop.featuredProducts || [];
  const recent = shop.newProducts || [];

  return (
    <div className="container pt-3 mb-5 px-2 px-sm-3">
      {/* Banner */}
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

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="mb-5">
          <h4 className="mb-3">Our Featured Products</h4>
          <div id="shopFeaturedCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
            <div className="carousel-inner rounded">
              {featured.map((item, index) => (
                <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={item._id}>
                  <div className="card border-0 text-white">
                    <img
                      src={(item.images && item.images[0]) || 'https://placehold.co/1200x400?text=No+Image'}
                      className="d-block w-100"
                      alt={item.name}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                    <div className="card-img-overlay d-flex flex-column justify-content-end" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <h4 className="card-title">{item.name}</h4>
                      <p className="card-text fw-semibold">₹{item.price}</p>
                      <Link to={`/product/${item._id}`} className="btn btn-light btn-sm w-auto">View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {featured.length > 1 && (
              <>
                <button className="carousel-control-prev" type="button" data-bs-target="#shopFeaturedCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#shopFeaturedCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" />
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {recent.length > 0 && (
        <section className="mb-5">
          <h4 className="mb-3">🆕 New Arrivals</h4>
          <div id="shopRecentCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
            <div className="carousel-inner rounded">
              {recent.map((item, index) => (
                <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={item._id}>
                  <div className="card border-0 text-white">
                    <img
                      src={(item.images && item.images[0]) || 'https://placehold.co/1200x400?text=No+Image'}
                      className="d-block w-100"
                      alt={item.name}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                    <div className="card-img-overlay d-flex flex-column justify-content-end" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <h4 className="card-title">{item.name}</h4>
                      <p className="card-text fw-semibold">₹{item.price}</p>
                      <Link to={`/product/${item._id}`} className="btn btn-light btn-sm w-auto">View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recent.length > 1 && (
              <>
                <button className="carousel-control-prev" type="button" data-bs-target="#shopRecentCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#shopRecentCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" />
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* Shop Info */}
      <section className="text-center mb-4">
        <h2>{shop.name}</h2>
        <p className="text-muted mb-1">{categoryName}</p>
        {shop.address && <p className="text-muted mb-1">{shop.address}</p>}
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
      </section>

      {/* All Products */}
      <section className="mb-4">
        <h5 className="mb-3 mt-2">All Products</h5>
        {products.length === 0 ? (
          <div className="alert alert-info">No products listed yet for this shop.</div>
        ) : (
          <div className="row row-cols-4 row-cols-sm-4 row-cols-md-3 g-3">
            {products.map((p) => (
              <div key={p._id} className="col">
                <SmallProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
