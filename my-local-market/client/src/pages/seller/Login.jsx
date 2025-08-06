import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSeller } from '../../contexts/SellerContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useSeller();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/sellers/login', form);
      const { seller, token } = res.data;
      login(seller, token);
      alert('Login successful!');
      navigate('/seller/dashboard');
    } catch (err) {
      console.error('Login error full:', err);
      if (err.response) {
        console.error('Response error:', err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error setting up request:', err.message);
      }
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container pt-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: 400 }}>
        <h2 className="mb-4 text-center">Seller Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button className="btn btn-primary w-100" type="submit">
            Login
          </button>

          <div className="text-center mt-3">
            <p className="mb-0">
              Don’t have an account?{' '}
              <Link to="/register" className="text-primary text-decoration-underline">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
