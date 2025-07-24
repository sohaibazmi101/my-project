import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', price: '', description: '', imageUrl: '', availability: true });
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const seller = JSON.parse(localStorage.getItem('seller'));

  useEffect(() => {
    if (!token) return navigate('/login');

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get(`/shops/${seller.id}`);
    setProducts(res.data.products);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/products/${editId}/edit`, form);
        alert('Product updated!');
      } else {
        await api.post('/products/add', form);
        alert('Product added!');
      }
      setForm({ name: '', category: '', price: '', description: '', imageUrl: '', availability: true });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditId(product._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}/delete`);
    fetchProducts();
  };

  return (
    <div className="container mt-4">
      <h2>Your Product Dashboard</h2>

      <form onSubmit={handleSubmit} className="mt-4 mb-5">
        <h4>{editId ? 'Edit Product' : 'Add Product'}</h4>
        {['name', 'category', 'price', 'description', 'imageUrl'].map(field => (
          <div className="mb-3" key={field}>
            <label>{field}</label>
            <input
              className="form-control"
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" name="availability" checked={form.availability} onChange={handleChange} />
          <label className="form-check-label">Available</label>
        </div>
        <button className="btn btn-primary" type="submit">
          {editId ? 'Update' : 'Add'} Product
        </button>
      </form>

      <h4>Existing Products</h4>
      {products.length === 0 ? (
        <p>No products added yet.</p>
      ) : (
        <div className="row">
          {products.map(product => (
            <div className="col-md-4 mb-3" key={product._id}>
              <div className="card h-100">
                <img src={product.imageUrl} className="card-img-top" alt={product.name} />
                <div className="card-body">
                  <h5>{product.name}</h5>
                  <p>₹{product.price}</p>
                  <p>{product.category}</p>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(product)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
