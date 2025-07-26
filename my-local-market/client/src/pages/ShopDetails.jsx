import { useParams } from 'react-router-dom';
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
        setShop(res.data.shop);           // ✅ updated to match new response
        setProducts(res.data.products);   // ✅ all products separately
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!shop) return <div className="text-center mt-5">Loading...</div>;

  const featured = shop.featuredProducts || [];
  const recent = shop.newProducts || [];

  return (
    <div className="container mt-5 mb-5">
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

      {/* Shop Info */}
      <div className="text-center mb-4">
        <h2>{shop.name}</h2>
        {shop.category && <p className="text-muted mb-1">{shop.category}</p>}
        {shop.location && <p className="text-muted mb-1">📍 {shop.location}</p>}
        {shop.description && <p className="text-muted">{shop.description}</p>}

        {shop.whatsapp && (
          <a
            href={`https://wa.me/${shop.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success btn-sm mt-2"
          >
            💬 Chat with Seller on WhatsApp
          </a>
        )}
      </div>

      {/* Featured Products */}
      {featured.length > 0 && (
        <>
          <h4 className="mt-5 mb-3">🌟 Featured Products</h4>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
            {featured.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}

      {/* New Products */}
      {recent.length > 0 && (
        <>
          <h4 className="mt-5 mb-3">🆕 New Arrivals</h4>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
            {recent.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}

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
