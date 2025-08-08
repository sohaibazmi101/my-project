import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', address: '', shopCategory: '',
    whatsapp: '', location: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/sellers/register', form);
      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container pt-5 mt-5 mb-5">
      <h2 className="text-center mb-4">Register as a Seller</h2>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} className="row g-3">
            {[
              { name: 'name', label: 'Full Name' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'password', label: 'Password', type: 'password' },
              { name: 'phone', label: 'Phone Number' },
              { name: 'address', label: 'Shop Address' },
              { name: 'shopCategory', label: 'Shop Category' },
              { name: 'whatsapp', label: 'WhatsApp Number' },
              { name: 'location', label: 'Location (City/Area)' }
            ].map(({ name, label, type = 'text' }) => (
              <div className="col-12" key={name}>
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  name={name}
                  className="form-control"
                  value={form[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <div className="col-12 text-center">
              <button type="submit" className="btn btn-success w-100">Register</button>
            </div>

            <div className="col-12 text-center mt-3">
              <p className="mb-0">
                Already have an account?{' '}
                <Link to="/seller/login" className="text-primary text-decoration-underline">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}