import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', address: '', shopCategory: '',
    whatsapp: '', location: ''
  });

  const [banner, setBanner] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (banner) {
      formData.append('banner', banner); // 👈 this must match the multer field name
    }

    try {
      await api.post('/seller/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Register as a Seller</h2>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} className="row g-3" encType="multipart/form-data">
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

            {/* 🖼️ Banner Image Upload */}
            <div className="col-12">
              <label className="form-label">Shop Banner Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setBanner(e.target.files[0])}
                required
              />
            </div>

            <div className="col-12 text-center">
              <button type="submit" className="btn btn-success w-100">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
