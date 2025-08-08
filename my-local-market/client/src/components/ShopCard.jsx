import { Link } from 'react-router-dom';

export default function ShopCard({ shop }) {
  return (
    <div style={{ width: '120px' }}> {/* Smaller fixed width */}
      <Link
        to={`/shops/${shop._id}`}
        className="text-decoration-none text-dark"
      >
        <div className="card h-100 shadow-sm border-0">
          {shop.banner && (
            <img
              src={shop.banner}
              alt={`${shop.name} Banner`}
              className="card-img-top rounded"
              style={{ height: '60px', objectFit: 'cover' }}
            />
          )}
          <div className="card-body p-2 d-flex flex-column">
            <h6 className="mb-1 text-truncate">{shop.name}</h6>
            <p className="text-muted small mb-1 text-truncate">{shop.category}</p>
            {shop.location && (
              <p className="text-muted small mb-1 text-truncate">{shop.location}</p>
            )}
            <div
              className="btn btn-sm btn-outline-primary mt-auto w-100 text-center"
              style={{ fontSize: '0.50rem', pointerEvents: 'none' }}
            >
              View
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
