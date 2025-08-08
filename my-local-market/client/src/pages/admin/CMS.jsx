import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function CMS() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const section = 'homepage';

  useEffect(() => {
    api.get(`/admin/cms/${section}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
    .then(res => {
      setContent(res.data.content || '');
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    await api.post(`/admin/cms/${section}`, { content }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    });
    alert('Saved!');
  };

  return (
    <div>
      <h3>📝 Edit Homepage Content</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <textarea
            rows="10"
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="btn btn-primary mt-2" onClick={handleSave}>
            Save
          </button>
        </>
      )}
    </div>
  );
}
