import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    availability: true
  });

  const fetchProducts = async () => {
    const res = await api.get('/admin/products', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setProducts(res.data);
    setFilteredProducts(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get('/admin/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setCategories(res.data);
  };

  const toggleFeatured = async (id) => {
    await api.patch(`/admin/products/${id}/featured`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    fetchProducts();
  };

const handleDelete = async () => {
    if (!selectedProduct) return;
    await api.delete(`/products/${selectedProduct.productCode}/delete`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setShowDeleteModal(false);
    fetchProducts();
  };

  const handleEditSave = async () => {
    if (!selectedProduct) return;
    await api.put(`/products/${selectedProduct.productCode}/edit`, editForm, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setShowEditModal(false);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p, i) => (
            <tr key={p._id}>
              <td>{i + 1}</td>
              <td>{p.productCode}</td>
              <td>{p.name}</td>
              <td>{p.category?.name || p.category}</td>
              <td>{p.sellerId?.name || 'N/A'}</td>
              <td>₹{p.price}</td>
              <td>
                {p.featured ? (
                  <span className="badge bg-success">Yes</span>
                ) : (
                  <span className="badge bg-secondary">No</span>
                )}
              </td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => toggleFeatured(p._id)}
                >
                  {p.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => {
                    setSelectedProduct(p);
                    setEditForm({
                      name: p.name,
                      category: p.category?._id || p.category, // send ID if exists
                      price: p.price,
                      description: p.description || '',
                      availability: p.availability ?? true
                    });
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    setSelectedProduct(p);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Product</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label>Category</label>
                  <select
                    className="form-select"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label>Price</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  ></textarea>
                </div>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="availabilityCheck"
                    checked={editForm.availability}
                    onChange={(e) => setEditForm({ ...editForm, availability: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="availabilityCheck">
                    Available
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
