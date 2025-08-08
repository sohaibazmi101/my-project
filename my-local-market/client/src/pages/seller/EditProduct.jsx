import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function EditProduct() {
  const { id } = useParams(); // product id from route
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    availability: true,
    images: [], // URLs or base64 strings depending on your upload method
  });
  const [loading, setLoading] = useState(true);

  // Fetch product details on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    api.get(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setForm({
          name: res.data.name || '',
          category: res.data.category || '',
          price: res.data.price || '',
          description: res.data.description || '',
          availability: res.data.availability,
          images: res.data.images || [],
        });
        setLoading(false);
      })
      .catch(err => {
        alert('Failed to load product');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // For simplicity, assume images are uploaded elsewhere and you store URLs here
    // Or if you want to upload images here, you need to handle that with FormData and upload API
    setForm(prev => ({
      ...prev,
      images: files.map(f => URL.createObjectURL(f)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const updatedData = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      description: form.description,
      availability: form.availability,
      images: form.images,
    };

    try {
      await api.put(`/products/${id}/edit`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product updated successfully!');
      navigate('/seller/dashboard');
    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to update product');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container pt-5">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label>Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label>Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label>Price</label>
          <input
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3 form-check">
          <input
            name="availability"
            type="checkbox"
            checked={form.availability}
            onChange={handleChange}
            className="form-check-input"
            id="availabilityCheck"
          />
          <label htmlFor="availabilityCheck" className="form-check-label">Available</label>
        </div>

        <div className="mb-3">
          <label>Images (up to 4)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="form-control"
          />
          <small>Currently showing {form.images.length} images</small>
        </div>

        <button type="submit" className="btn btn-primary">Update Product</button>
      </form>
    </div>
  );
}
