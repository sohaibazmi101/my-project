import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div className="text-center mt-5">Loading...</div>;

  const images = product.images?.filter(Boolean) || [];

  return (
    <div className="container mt-5">
      <div className="card mx-auto shadow-sm" style={{ maxWidth: '800px' }}>

        {/* Bootstrap Carousel for Images */}
        {images.length > 0 && (
          <div id={`product-carousel-${product._id}`} className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              {images.map((img, idx) => (
                <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
                  <img
                    src={img}
                    alt={`Product Image ${idx + 1}`}
                    className="d-block w-100"
                    style={{ objectFit: 'cover', maxHeight: '400px' }}
                  />
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target={`#product-carousel-${product._id}`}
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target={`#product-carousel-${product._id}`}
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Product Info */}
        <div className="card-body">
          <h3 className="card-title">{product.name}</h3>
          <p className="card-text">{product.description}</p>
          <h5 className="text-primary">₹{product.price}</h5>
          <p className="text-muted">
            Availability: {product.availability ? "✅ In stock" : "❌ Out of stock"}
          </p>

          {/* Visit Seller Shop */}
          {product.sellerId && (
            <Link
              to={`/shops/${typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId}`}
              className="btn btn-outline-primary me-2"
            >
              Visit Seller’s Shop
            </Link>
          )}

          {/* WhatsApp Contact */}
          {product?.sellerId?.whatsapp && (
            <a
              href={`https://wa.me/${product.sellerId.whatsapp}`}
              className="btn btn-success w-100 mt-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
