import React from 'react';

export default function OfferProductCard({ product }) {
  if (!product) return null;

  const { name, category, price, offer, images, sellerId } = product;

  // Calculate discounted price if offer is active and valid
  const hasOffer = offer?.isActive;
  const discountPercentage = hasOffer ? offer.percentage : 0;

  // Show previous price from offer.previousPrice or fallback to price
  const previousPrice = hasOffer && offer.previousPrice ? offer.previousPrice : null;

  // Calculate final price based on offer percentage
  const discountedPrice = hasOffer && previousPrice
    ? (previousPrice * (100 - discountPercentage)) / 100
    : price;

  return (
    <div className="card" style={{ width: '18rem', position: 'relative' }}>
      {/* Discount Badge */}
      {hasOffer && discountPercentage > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          zIndex: 10,
        }}>
          -{discountPercentage}%
        </div>
      )}

      {/* Product Image */}
      <img
        src={images && images.length > 0 ? images[0] : 'https://via.placeholder.com/286x180?text=No+Image'}
        className="card-img-top"
        alt={name}
        style={{ height: '180px', objectFit: 'cover' }}
      />

      <div className="card-body">
        {/* Product Name */}
        <h5 className="card-title" style={{ minHeight: '3rem' }}>{name}</h5>

        {/* Category */}
        <p className="card-text text-muted">{category}</p>

        {/* Price */}
        <p className="card-text">
          {hasOffer && previousPrice ? (
            <>
              <span style={{ textDecoration: 'line-through', color: '#888', marginRight: '8px' }}>
                ₹{previousPrice.toFixed(2)}
              </span>
              <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                ₹{discountedPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span style={{ fontWeight: 'bold' }}>₹{price.toFixed(2)}</span>
          )}
        </p>

        {/* Seller info */}
        {sellerId && (
          <p className="card-text" style={{ fontSize: '0.85rem', color: '#555' }}>
            Seller: {sellerId.name} {sellerId.whatsapp && `| WhatsApp: ${sellerId.whatsapp}`}
          </p>
        )}
      </div>
    </div>
  );
}
