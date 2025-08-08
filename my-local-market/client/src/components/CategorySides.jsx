import React from 'react';

export default function CategoryCard({ category }) {
  return (
    <div
      className="text-center"
      style={{ cursor: 'default', margin: '4px 8px' }} // less margin: 4px vertical, 8px horizontal
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
        {category?.icon ? (
          <img
            src={category.icon}
            alt={category.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '1.5rem' }}>?</span>
        )}
      </div>
      <div style={{ fontSize: '0.85rem', marginTop: 3 }}>{category.name}</div> {/* reduced marginTop */}
    </div>
  );
}
