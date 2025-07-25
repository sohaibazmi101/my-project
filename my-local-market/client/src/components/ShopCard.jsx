import { Link } from 'react-router-dom';

export default function ShopCard({ shop }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 mb-4">
      <div className="card h-100 shadow-sm">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{shop.name}</h5>
          <p className="card-text text-muted">{shop.shopCategory}</p>
          <Link to={`/shops/${shop._id}`} className="btn btn-sm btn-outline-primary mt-auto">
            View Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
