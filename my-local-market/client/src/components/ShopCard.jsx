import { Link } from 'react-router-dom';

export default function ShopCard({ shop }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{shop.name}</h5>
          <p className="card-text">{shop.shopCategory}</p>
          <Link to={`/shops/${shop._id}`} className="btn btn-primary">View Shop</Link>
        </div>
      </div>
    </div>
  );
}
