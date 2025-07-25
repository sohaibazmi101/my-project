import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ imageUrl: '', title: '', description: '', link: '' });
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    const res = await api.get('/admin/banners', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    setBanners(res.data);
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('banner', file);

    try {
      const res = await api.post('/admin/banners/upload', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) return alert('Please upload or paste an image URL');

    await api.post('/admin/banners', form, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });

    setForm({ imageUrl: '', title: '', description: '', link: '' });
    fetchBanners();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete banner?')) return;
    await api.delete(`/admin/banners/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    fetchBanners();
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div>
      <h3>🖼️ Manage Banners</h3>

      <form onSubmit={handleSubmit} className="row g-3 mt-3 mb-4">
        {/* File Upload */}
        <div className="col-md-3">
          <input
            type="file"
            className="form-control"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            disabled={uploading}
          />
        </div>

        {/* Or image URL */}
        <div className="col-md-3">
          <input
            type="url"
            className="form-control"
            placeholder="Or paste image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>

        {/* Preview */}
        {form.imageUrl && (
          <div className="col-md-2">
            <img src={form.imageUrl} alt="Preview" className="img-fluid rounded" />
          </div>
        )}

        {/* Title */}
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Title (optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Link (optional) */}
        <div className="col-md-3">
          <input
            type="url"
            className="form-control"
            placeholder="Optional link (e.g. /shops)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </div>

        {/* Submit */}
        <div className="col-md-2">
          <button className="btn btn-success w-100" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Add Banner'}
          </button>
        </div>
      </form>

      <div className="row row-cols-1 row-cols-md-2 g-4">
        {banners.map(b => (
          <div className="col" key={b._id}>
            <div className="card">
              <img src={b.imageUrl} className="card-img-top" alt={b.title || 'Banner'} />
              <div className="card-body">
                {b.title && <h5 className="card-title">{b.title}</h5>}
                {b.description && <p className="card-text">{b.description}</p>}
                {b.link && (
                  <a href={b.link} className="btn btn-sm btn-outline-primary me-2" target="_blank" rel="noreferrer">
                    Visit
                  </a>
                )}
                <button
                  className="btn btn-sm btn-danger float-end"
                  onClick={() => handleDelete(b._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
