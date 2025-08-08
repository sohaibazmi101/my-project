import { Link } from 'react-router-dom';

export default function ProductCardForSeller({
  product,
  quantity,
  showQuantity,
  isFeatured = false,
  isNew = false,
  onToggleFeatured,
  onToggleNew,
  onEdit, 
  onDelete,
}) {
  const image = product.images?.filter(Boolean)?.[0];
  const total = product.price * quantity;

  return (
    <div className="card mb-1 shadow-sm" style={{ width: '140px' }}>
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
        {image && (
          <img
            src={image}
            alt={product.name}
            className="card-img-top"
            style={{ height: '90px', objectFit: 'cover' }}
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
            style={{ fontSize: '0.55rem', marginBottom: 0 }}
          >
            ₹{product.price}
          </p>
          {/* Product Code display */}
          <p
            className="text-muted mb-1"
            style={{ fontSize: '0.5rem', fontWeight: 'bold', letterSpacing: '0.5px' }}
          >
            Code: {product.productCode}
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
      </Link>

      {/* Buttons to toggle featured, new, edit, and delete */}
      <div className="d-flex justify-content-center mb-2 flex-wrap gap-1">
        {onToggleFeatured && (
          <button
            type="button"
            className={`btn btn-sm me-1 ${isFeatured ? 'btn-warning' : 'btn-outline-warning'}`}
            style={{ fontSize: '0.55rem', padding: '1px 5px' }}
            onClick={() => onToggleFeatured(product._id)}
          >
            {isFeatured ? 'Unmark Featured' : 'Mark Featured'}
          </button>
        )}

        {onToggleNew && (
          <button
            type="button"
            className={`btn btn-sm ${isNew ? 'btn-info' : 'btn-outline-info'}`}
            style={{ fontSize: '0.55rem', padding: '1px 5px' }}
            onClick={() => onToggleNew(product._id)}
          >
            {isNew ? 'Unmark New' : 'Mark New'}
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            style={{ fontSize: '0.55rem', padding: '1px 5px' }}
            onClick={() => onEdit(product._id)}
          >
            Edit
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="btn btn-sm btn-danger"
            style={{ fontSize: '0.55rem', padding: '1px 5px' }}
            onClick={() => onDelete(product._id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
