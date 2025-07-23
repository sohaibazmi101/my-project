import React, { useState } from 'react';
import axios from 'axios';

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token'); // Get seller token
  const shopId = localStorage.getItem('shopId'); // Assuming shopId is stored after login

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !shopId) {
      setMessage('Token or Shop ID missing!');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('shopId', shopId); // important!
    if (image) data.append('image', image);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/products/add',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('✅ Product added successfully!');
      setFormData({ name: '', description: '', price: '', category: '' });
      setImage(null);
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required /><br />
        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required /><br />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required /><br />
        <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required /><br />
        <input type="file" accept="image/*" onChange={handleImageChange} /><br />
        <button type="submit">Add Product</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
};

export default AddProductForm;
