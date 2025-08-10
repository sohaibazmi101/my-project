import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductDetails({
  product,
  isInCart,
  loading,
  onAddToCart,
  onBuyNow
}) {
  return (
    <div className="card-body">
      <h3 className="card-title">{product.name}</h3>
      <p className="card-text">{product.description}</p>
      <h5 className="text-primary">₹{product.price}</h5>
      <p className="text-muted">
        Availability: {product.availability ? "✅ In stock" : "Out of stock"}
      </p>

      <div className="d-flex gap-3 mt-3">
        <button onClick={onBuyNow} className="btn btn-primary">Buy Now</button>
        <button
          onClick={onAddToCart}
          className="btn btn-warning"
          disabled={isInCart || loading}
        >
          {loading ? 'Adding...' : isInCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>

      {product.shop && (
        <Link
          to={`/shops/${typeof product.shop === 'object' ? product.shop._id : product.shop}`}
          className="btn btn-outline-primary mt-3"
        >
          Visit Seller’s Shop
        </Link>
      )}

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
  );
}