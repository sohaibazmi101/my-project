import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', icon: '' });
  const [uploading, setUploading] = useState(false);

  const fetchCategories = async () => {
    const res = await api.get('/admin/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    const sorted = res.data.sort((a, b) => a.rank - b.rank);
    setCategories(sorted);
  };

  const handleFileUpload = async (file) => {
  setUploading(true);
  const formData = new FormData();
  formData.append('icon', file);

  try {
    const res = await api.post('/admin/categories/upload', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    setForm((prev) => ({ ...prev, icon: res.data.imageUrl }));
  } catch (err) {
    console.error('Upload failed:', err);
    alert('Upload failed');
  } finally {
    setUploading(false);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.icon) {
      alert('Name and icon required');
      return;
    }

    await api.post('/admin/categories', form, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setForm({ name: '', icon: '' });
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await api.delete(`/admin/categories/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    fetchCategories();
  };

  const handleMove = async (id, direction) => {
    await api.patch(`/admin/categories/${id}/move`, { direction }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <h3>📦 Manage Categories</h3>

      <form onSubmit={handleSubmit} className="row g-3 mt-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="col-md-3">
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            disabled={uploading}
          />
        </div>

        <div className="col-md-2">
          <button className="btn btn-success w-100" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Icon</th>
              <th>Name</th>
              <th>Rank</th>
              <th>Move</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
                <td>
                  <img
                    src={cat.icon}
                    alt="icon"
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                  />
                </td>
                <td>{cat.name}</td>
                <td>{cat.rank ?? '-'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-secondary me-1"
                    onClick={() => handleMove(cat._id, 'up')}
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleMove(cat._id, 'down')}
                    disabled={i === categories.length - 1}
                  >
                    ↓
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(cat._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">No categories yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
