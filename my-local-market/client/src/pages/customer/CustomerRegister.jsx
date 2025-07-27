import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers/register', form);
      alert('Registered successfully. Please log in.');
      navigate('/customer/login');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4">Create Customer Account</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="form-control" />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="form-control" />
        </div>
        <div className="mb-3">
          <label>Phone</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} required className="form-control" />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary w-100">Register</button>
      </form>
    </div>
  );
}
