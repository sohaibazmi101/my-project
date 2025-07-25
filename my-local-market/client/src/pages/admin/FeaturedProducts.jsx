import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const res = await api.get('/admin/products', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setProducts(res.data);
  };

  const toggleFeatured = async (id) => {
    await api.patch(`/admin/products/${id}/featured`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h3>🌟 Manage Featured Products</h3>

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Category</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Featured</th>
            <th>Toggle</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p._id}>
              <td>{i + 1}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.sellerId?.name || 'N/A'}</td>
              <td>₹{p.price}</td>
              <td>
                {p.featured ? (
                  <span className="badge bg-success">Yes</span>
                ) : (
                  <span className="badge bg-secondary">No</span>
                )}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => toggleFeatured(p._id)}
                >
                  {p.featured ? 'Unfeature' : 'Feature'}
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center">No products available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
