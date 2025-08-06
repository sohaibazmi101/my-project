import { useContext, useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { CustomerContext } from '../../contexts/CustomerContext';

export default function UpdateCustomerProfile() {
  const { customer, token } = useContext(CustomerContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || '',
        phone: customer.phone || '',
        street: customer.address?.street || '',
        city: customer.address?.city || '',
        state: customer.address?.state || '',
        pincode: customer.address?.pincode || '',
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/customers', {
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode
        }
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('customerToken')}` }
      });
      alert('Profile updated successfully!');
      navigate('/customer/profile'); // Go back after update
    } catch (err) {
      console.error('Update failed', err);
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">Edit Profile</h2>
      <form onSubmit={handleUpdate} className="card p-4 shadow">
        <div className="mb-3">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Full Address</label>
          <input name="street" value={form.street} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>City</label>
          <input name="city" value={form.city} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>State</label>
          <input name="state" value={form.state} onChange={handleChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label>Pincode</label>
          <input name="pincode" value={form.pincode} onChange={handleChange} className="form-control" />
        </div>
        <button type="submit" className="btn btn-success">Save Changes</button>
      </form>
    </div>
  );
}
