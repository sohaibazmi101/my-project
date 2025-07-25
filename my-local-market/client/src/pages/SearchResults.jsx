import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

export default function SearchResults() {
  const [results, setResults] = useState([]);
  const { search } = useLocation();
  const query = new URLSearchParams(search).get('q');

  useEffect(() => {
    if (query) {
      api.get(`/products/search?q=${encodeURIComponent(query)}`)
        .then(res => setResults(res.data))
        .catch(() => setResults([]));
    }
  }, [query]);

  return (
    <div className="container mt-5 mb-5">
      <h3 className="mb-4">
        Search Results for: <strong>{query}</strong>
      </h3>

      {results.length === 0 ? (
        <div className="alert alert-info">No products found for this search.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          {results.map(p => (
            <div key={p._id} className="col">
              <div className="card h-100">
                <img
                  src={p.images?.[0] || 'https://via.placeholder.com/300x200'}
                  className="card-img-top"
                  alt={p.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text">₹{p.price}</p>
                  <Link to={`/product/${p._id}`} className="btn btn-sm btn-outline-primary">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
