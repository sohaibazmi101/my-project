import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const images = product.images?.filter(Boolean) || []; // ensure it's an array

  return (
    <div className="col-12 col-sm-6 col-md-4 mb-4">
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

            {/* Navigation arrows only if multiple images */}
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
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text text-muted mb-3">₹{product.price}</p>
          <Link to={`/product/${product._id}`} className="btn btn-sm btn-outline-primary mt-auto">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
