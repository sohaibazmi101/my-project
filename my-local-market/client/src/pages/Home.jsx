import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container text-center mt-5">
      <h1>🛍️ Welcome to Local Shop</h1>
      <p className="lead">
        Discover and shop from verified local stores near you.
      </p>

      <div className="mt-4">
        <Link to="/shops" className="btn btn-primary btn-lg mx-2">
          Browse Shops
        </Link>
        <Link to="/register" className="btn btn-outline-secondary btn-lg mx-2">
          Become a Seller
        </Link>
      </div>
    </div>
  );
}
