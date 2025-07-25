import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    images: ['', '', '', ''], // 4 images
    availability: true,
  });
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const seller = JSON.parse(localStorage.getItem('seller'));

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/shops/${seller.id}`);
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileUpload = async (file, index) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/products/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setForm((prev) => {
        const updatedImages = [...prev.images];
        updatedImages[index] = res.data.imageUrl;
        return { ...prev, images: updatedImages };
      });
    } catch (err) {
      alert('Image upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.images[0]) {
      return alert('Please upload at least the first product image.');
    }

    try {
      if (editId) {
        await api.put(`/products/${editId}/edit`, form);
        alert('Product updated!');
      } else {
        await api.post('/products/add', form);
        alert('Product added!');
      }

      setForm({
        name: '',
        category: '',
        price: '',
        description: '',
        images: ['', '', '', ''],
        availability: true,
      });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setForm({
      ...product,
      images: [...(product.images || []), '', '', '', ''].slice(0, 4),
    });
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

        {/* Name */}
        <div className="mb-3">
          <label>Name</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Category */}
        <div className="mb-3">
          <label>Category</label>
          <select
            className="form-select"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="mb-3">
          <label>Price</label>
          <input
            type="number"
            className="form-control"
            name="price"
            value={form.price}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label>Description</label>
          <input
            className="form-control"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* Image Uploads */}
        <div className="mb-3">
          <label>Product Images</label>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mb-2">
              <input
                type="file"
                className="form-control"
                onChange={(e) => handleFileUpload(e.target.files[0], i)}
              />
              {form.images[i] && (
                <img
                  src={form.images[i]}
                  alt={`Preview ${i + 1}`}
                  className="img-thumbnail mt-2"
                  style={{ maxHeight: '150px' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Availability */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="availability"
            checked={form.availability}
            onChange={handleChange}
          />
          <label className="form-check-label">Available</label>
        </div>

        <button className="btn btn-primary" type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : editId ? 'Update' : 'Add'} Product
        </button>
      </form>

      <h4>Existing Products</h4>
      {products.length === 0 ? (
        <p>No products added yet.</p>
      ) : (
        <div className="row">
          {products.map((product) => (
            <div className="col-md-4 mb-3" key={product._id}>
              <div className="card h-100">
                <img
                  src={product.images?.[0] || ''}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5>{product.name}</h5>
                  <p>₹{product.price}</p>
                  <p>{product.category}</p>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
