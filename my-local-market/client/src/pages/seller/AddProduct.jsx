import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function AddProduct() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    images: ['', '', '', ''],
    availability: true,
  });

  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { id } = useParams(); // product ID for editing (optional)
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCategories();

    if (id) {
      api.get(`/products/${id}`)
        .then(res => {
          const product = res.data;
          setForm({
            ...product,
            images: [...(product.images || []), '', '', '', ''].slice(0, 4),
          });
        })
        .catch(err => console.error('Error loading product', err));
    }
  }, [id]);

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
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    if (!form.images[0]) return alert('Please upload at least the first image.');

    try {
      if (id) {
        await api.put(`/products/${id}/edit`, form);
        alert('Product updated');
      } else {
        await api.post('/products/add', form);
        alert('Product added');
      }
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  return (
    <div className="container mt-5">
      <h2>{id ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="mt-4 mb-5">
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

        {/* Images */}
        <div className="mb-3">
          <label>Product Images (1–4)</label>
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

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'Uploading...' : id ? 'Update Product' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
