import { Link } from 'react-router-dom';

export default function ShopCard({ shop }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 mb-4">
      <div className="card h-100 shadow-sm">
        {shop.banner && (
          <img
            src={shop.banner}
            alt={`${shop.name} Banner`}
            className="card-img-top"
            style={{ height: '180px', objectFit: 'cover' }}
          />
        )}
        <div className="card-body d-flex flex-column">
          <h5 className="card-title mb-1">{shop.name}</h5>
          <p className="text-muted mb-1">{shop.category}</p>
          {shop.location && <p className="small text-muted">{shop.location}</p>}
          {shop.description && (
            <p className="card-text small mt-1 text-truncate">
              {shop.description}
            </p>
          )}
          <Link to={`/shops/${shop._id}`} className="btn btn-sm btn-outline-primary mt-auto">
            View Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
