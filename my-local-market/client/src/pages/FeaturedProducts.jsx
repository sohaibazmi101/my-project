import React, { useEffect, useState } from 'react';
import api from '../services/api'; // adjust if needed
import { Link } from 'react-router-dom';

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products/featured');
        setFeatured(res.data);
      } catch (err) {
        console.error('Error fetching featured products:', err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="conatiner pt-5">
      <h2 className="mb-4">All Featured Products</h2>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {featured.length > 0 ? (
          featured.map((item) => (
            <div key={item._id} className="col">
              <div className="card h-100">
                <img
                  src={item.images?.[0] || 'https://placehold.co/300x200'}
                  alt={item.name}
                  className="card-img-top"
                  style={{ objectFit: 'cover', height: '200px' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{item.name}</h5>
                  <p className="card-text">₹{item.price}</p>
                  <Link to={`/product/${item._id}`} className="btn btn-sm btn-outline-primary">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No featured products found.</p>
        )}
      </div>
    </div>
  );
}