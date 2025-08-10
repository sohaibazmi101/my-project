import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function RegisterSeller() {
  const [form, setForm] = useState({
    sellerName: '', // personal name
    email: '',
    password: '',
    phone: '',
    address: '',
    shopCategory: '', // This will be used to create the shop later
    whatsapp: '',
    location: '',
    aadhaarNumber: '',
    panNumber: ''
  });
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [panImage, setPanImage] = useState(null);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available categories from the backend
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (aadhaarImage) formData.append('aadhaarImage', aadhaarImage);
      if (panImage) formData.append('panImage', panImage);

      const res = await api.post('/sellers/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(res.data.message || 'Registered successfully!');
      navigate('/seller/login');
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Register as a Seller</h2>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form onSubmit={handleSubmit} className="row g-3">
            {[
              { name: 'sellerName', label: 'Full Name' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'password', label: 'Password', type: 'password' },
              { name: 'phone', label: 'Phone Number' },
              { name: 'address', label: 'Residential Address' },
              { name: 'whatsapp', label: 'WhatsApp Number' },
              { name: 'location', label: 'Location (City/Area)' },
              { name: 'aadhaarNumber', label: 'Aadhaar Number' },
              { name: 'panNumber', label: 'PAN Number' }
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

            {/* Shop Category Dropdown */}
            <div className="col-12">
              <label className="form-label">Shop Category</label>
              <select
                name="shopCategory"
                className="form-control"
                value={form.shopCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Aadhaar Image</label>
              <input
                type="file"
                name="aadhaarImage"
                className="form-control"
                accept="image/*"
                onChange={(e) => setAadhaarImage(e.target.files[0])}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">PAN Image</label>
              <input
                type="file"
                name="panImage"
                className="form-control"
                accept="image/*"
                onChange={(e) => setPanImage(e.target.files[0])}
                required
              />
            </div>

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