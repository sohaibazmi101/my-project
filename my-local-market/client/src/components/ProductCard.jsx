import { Link } from 'react-router-dom';

export default function ProductCard({ product, quantity, showQuantity }) {
  const image = product.images?.filter(Boolean)?.[0]; // First valid image
  const total = product.price * quantity;

  return (
    <Link
      to={`/product/${product._id}`}
      className="text-decoration-none text-dark"
      style={{ flex: 1 }}
    >
      <div className="card h-100 shadow-sm position-relative">
        {/* Product Image */}
        {image && (
          <img
            src={image}
            alt={product.name}
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover' }}
          />
        )}

        {/* Card content */}
        <div className="card-body d-flex flex-column">
          <h5 className="card-title mb-1">{product.name}</h5>
          <p className="card-text text-muted mb-2">₹{product.price}</p>

          {showQuantity && (
            <div className="mt-auto pt-2 border-top">
              <strong>Quantity:</strong> {quantity}
              <span className="mx-3"></span>
              <strong>Total:</strong> ₹{total}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
