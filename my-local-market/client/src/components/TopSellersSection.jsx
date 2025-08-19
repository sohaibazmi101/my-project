import React, { useEffect, useState } from 'react';
import { data, Link } from 'react-router-dom';
import api from '../services/api'; 
import ShopCard from './ShopCard';

export default function TopSellersSection() {
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        const res = await api.get('/shops/featured');
        setTopSellers(res.data);
        console.log('Data:',res.data);
      } catch (error) {
        console.error('Failed to fetch top sellers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopSellers();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '1rem', marginTop: '1rem' }}>
        <p>Loading top sellers...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom, #4fed74ff, #f6fff8)',
        borderRadius: '8px',
        padding: '1rem',
        paddingBottom: '0.5rem',
        marginTop: '1rem'
      }}
    >
      <h5 className="mb-2 d-flex justify-content-between align-items-center">
        <span>Top Sellers</span>
        <Link 
          to="/shops" 
          className="btn btn-link text-decoration-none p-0 d-flex align-items-center"
        >
          See all
          <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </h5>
      <div
        className="scroll-container pb-1 d-flex hide-scroll"
        style={{
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}
      >
        {topSellers.length > 0 ? (
          topSellers.map((shop) => (
            <div key={shop._id} style={{ flex: '0 0 auto' }}>
              <ShopCard shop={shop} />
            </div>
          ))
        ) : (
          <p>No top sellers yet</p>
        )}
      </div>
    </div>
  );
}