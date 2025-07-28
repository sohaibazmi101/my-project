import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCustomer } from '../../contexts/CustomerContext'; // ✅ IMPORT CONTEXT

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { setCustomer } = useCustomer(); // ✅ GET setCustomer FROM CONTEXT
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers/login', form);
      localStorage.setItem('customerToken', res.data.token);
      setCustomer(res.data.customer);
      localStorage.removeItem('token')
      localStorage.removeItem('seller')
      alert('Logged in successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4">Customer Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email or Phone</label>
          <input
            type="text"
            name="emailOrPhone"
            value={form.emailOrPhone}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-success w-100">Login</button>
      </form>
    </div>
  );
}
