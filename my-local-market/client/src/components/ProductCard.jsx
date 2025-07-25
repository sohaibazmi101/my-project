import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 mb-4">
      <div className="card h-100 shadow-sm">
        <img
          src={product.imageUrl}
          className="card-img-top img-fluid"
          alt={product.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
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
