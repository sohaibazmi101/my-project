import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', icon: '' });

  const fetchCategories = async () => {
    const res = await api.get('/admin/categories', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setCategories(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

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

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <h3>📦 Manage Categories</h3>

      <form onSubmit={handleSubmit} className="row g-3 mt-3">
        <div className="col-md-5">
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
            type="text"
            className="form-control"
            placeholder="Icon (emoji or image URL)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-success w-100">Add</button>
        </div>
      </form>

      <div className="mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Icon</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat._id}>
                <td>{i + 1}</td>
                <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                <td>{cat.name}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">No categories yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
