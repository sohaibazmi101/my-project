import { Link } from 'react-router-dom';

export default function SmallProductCard({ product, quantity, showQuantity }) {
  const image = product.images?.filter(Boolean)?.[0];
  const total = product.price * quantity;

  return (
    <Link
      to={`/product/${product._id}`}
      className="text-decoration-none text-dark"
    >
      <div className="card mb-1 shadow-sm" style={{ width: '70px' }}>
        {/* Product Image */}
        {image && (
          <img
            src={image}
            alt={product.name}
            className="card-img-top"
            style={{ height: '50px', objectFit: 'cover' }}
          />
        )}

        {/* Text Content */}
        <div className="card-body p-1">
          <h6
            className="card-title mb-1 text-truncate"
            title={product.name}
            style={{ fontSize: '0.6rem' }}
          >
            {product.name}
          </h6>
          <p
            className="card-text text-muted mb-1"
            style={{ fontSize: '0.55rem' }}
          >
            ₹{product.price}
          </p>

          {showQuantity && (
            <small
              className="text-muted d-block"
              style={{ fontSize: '0.5rem', lineHeight: '1.1' }}
            >
              <strong>Qty:</strong> {quantity}
              <br />
              <strong>Total:</strong> ₹{total}
            </small>
          )}
        </div>
      </div>
    </Link>
  );
}
