import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchCode, setSearchCode] = useState('');

  const fetchProducts = async () => {
    const res = await api.get('/admin/products', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setProducts(res.data);
    setFilteredProducts(res.data);
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

  useEffect(() => {
  if (!searchCode) {
    setFilteredProducts(products);
  } else {
    const filtered = products.filter(p =>
      p.productCode && p.productCode.toLowerCase().includes(searchCode.toLowerCase())
    );
    setFilteredProducts(filtered);
  }
}, [searchCode, products]);


  return (
    <div>
      <h3>Manage Featured Products</h3>

      {/* Search bar for productCode */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Product Code..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
      </div>

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Product Code</th>
            <th>Product</th>
            <th>Category</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Featured</th>
            <th>Toggle</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p, i) => (
            <tr key={p._id}>
              <td>{i + 1}</td>
              <td>{p.productCode}</td>
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
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center">No products available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
