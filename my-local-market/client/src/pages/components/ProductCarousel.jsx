import React from 'react';

export default function ProductCarousel({ images = [], productId }) {
  if (images.length === 0) return null;

  return (
    <div id={`product-carousel-${productId}`} className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {images.map((img, idx) => (
          <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
            <img
              src={img}
              alt={`Product Image ${idx + 1}`}
              className="d-block w-100"
              style={{ objectFit: 'cover', maxHeight: '400px' }}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" data-bs-target={`#product-carousel-${productId}`} data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target={`#product-carousel-${productId}`} data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </>
      )}
    </div>
  );
}