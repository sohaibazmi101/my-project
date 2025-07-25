import { useState } from 'react';
import api from '../../services/api';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', form);
      localStorage.setItem('adminToken', res.data.token);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div
      className="container"
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: 'calc(100vh - 140px)', // Adjust if footer or navbar is taller
        paddingTop: '1rem',
        paddingBottom: '1rem',
      }}
    >
      <div className="w-100" style={{ maxWidth: 400 }}>
        <div className="card p-4 shadow-sm rounded">
          <h3 className="text-center mb-4">Admin Login</h3>
          <form onSubmit={handleSubmit}>
            {error && <p className="text-danger text-center">{error}</p>}
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}
