import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SmallProductCard from './SmallProductCard'; // Ensure this path is correct

export default function TopCategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ...
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/top-with-products');
        console.log('API Response Data:', res.data); // <-- Add this line
        setCategories(res.data);
      } catch (error) {
        // ...
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);
// ...

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {categories.map((category) => (
        <div
          key={category._id}
          style={{
            background: 'linear-gradient(to bottom, #50ef75ff, #f6fff8)',
            borderRadius: '8px',
            padding: '1rem',
            paddingBottom: '0.5rem',
            marginTop: '1rem'
          }}
        >
          <h5 className="mb-2 d-flex align-items-center">
            <i className={`bi ${category.icon} me-2`}></i> {/* Display the icon */}
            <span>{category.name}</span>
          </h5>
          <div
            className="scroll-container pb-1 d-flex hide-scroll"
            style={{
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}
          >
            {category.products.length > 0 ? (
              category.products.map((product) => (
                <div key={product._id} style={{ flex: '0 0 auto' }}>
                  <SmallProductCard product={product} quantity={1} showQuantity={false} />
                </div>
              ))
            ) : (
              <p>No products in this category yet</p>
            )}
          </div>
        </div>
      ))}
    </>
  );
}