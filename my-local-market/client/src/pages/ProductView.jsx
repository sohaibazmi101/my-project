import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const token = localStorage.getItem('customerToken');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div className="text-center mt-5">Loading...</div>;

  const images = product.images?.filter(Boolean) || [];

  // 🔹 Add to Cart Handler
  const handleAddToCart = async () => {
    if (!token) return navigate('/customer/login');
    try {
      await api.post('/cart/add', {
        productId: product._id,
        quantity: 1,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product added to cart!');
    } catch (err) {
      console.error('Add to cart failed', err);
      alert('Failed to add to cart');
    }
  };

  // 🔹 Buy Now Handler
  const handleBuyNow = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) return alert('Please login to place an order');

      const cart = [
        {
          product: product._id,
          quantity: 1, // or dynamic quantity
        },
      ];

      await api.post(
        '/customers/orders',
        { cart },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Order placed successfully!');
    } catch (err) {
      console.error('Buy Now failed', err);
      alert('Failed to place order');
    }
  };


  return (
    <div className="container mt-5">
      <div className="card mx-auto shadow-sm" style={{ maxWidth: '800px' }}>
        {/* Carousel */}
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
                <button className="carousel-control-prev" type="button" data-bs-target={`#product-carousel-${product._id}`} data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target={`#product-carousel-${product._id}`} data-bs-slide="next">
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

          {/* Buttons */}
          <div className="d-flex gap-3 mt-3">
            <button onClick={handleBuyNow} className="btn btn-primary">Buy Now</button>
            <button onClick={handleAddToCart} className="btn btn-warning">Add to Cart</button>
          </div>

          {/* View Shop Button */}
          {product.shop && (
            <Link
              to={`/shops/${typeof product.shop === 'object' ? product.shop._id : product.shop}`}
              className="btn btn-outline-primary mt-3"
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
