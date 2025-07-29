import { Link } from 'react-router-dom';

export default function ProductCard({ product, quantity, showQuantity }) {
  const images = product.images?.filter(Boolean) || [];
  const total = product.price * quantity;

  return (
    <div className="card h-100 shadow-sm">
      {/* Carousel */}
      {images.length > 0 && (
        <div id={`carousel-${product._id}`} className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            {images.map((img, idx) => (
              <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
                <img
                  src={img}
                  className="d-block w-100"
                  alt={`Product ${idx + 1}`}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#carousel-${product._id}`}
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#carousel-${product._id}`}
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
              </button>
            </>
          )}
        </div>
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-1">{product.name}</h5>
        <p className="card-text text-muted mb-3">₹{product.price}</p>
        <Link to={`/product/${product._id}`} className="btn btn-sm btn-outline-primary mt-auto">
          View
        </Link>
        {showQuantity && (
  <div>
    <strong>Quantity:</strong> {quantity}
    <span className="mx-3"></span>
    <strong>Total:</strong> ₹{total}
  </div>
)}

      </div>
    </div>
  );
}
