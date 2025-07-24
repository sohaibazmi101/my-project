import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        <img src={product.imageUrl} className="card-img-top" alt={product.name} />
        <div className="card-body">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text">₹{product.price}</p>
          <Link to={`/product/${product._id}`} className="btn btn-sm btn-outline-primary">View</Link>
        </div>
      </div>
    </div>
  );
}
