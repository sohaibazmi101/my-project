// components/CategoryCard.jsx
import React from 'react';

export default function CategoryCard({ category, onClick }) {
  return (
    <div
      className="text-center mx-2 my-2"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div
        className="rounded-circle shadow-sm bg-white d-flex align-items-center justify-content-center mx-auto"
        style={{
          width: 50,
          height: 50,
          overflow: 'hidden',
          border: '1px solid #ddd',
        }}
      >
        {category?.icon?.startsWith('http') ? (
          <img
            src={category.icon}
            alt={category.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
        )}
      </div>
      <div style={{ fontSize: '0.85rem', marginTop: 6 }}>{category.name}</div>
    </div>
  );
}
