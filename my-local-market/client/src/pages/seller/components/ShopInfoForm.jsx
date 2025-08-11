import React from 'react';

export default function ShopInfoForm({
  shop,
  banner,
  uploading,
  onInputChange,
  onBannerUpload,
  onSave,
}) {
  return (
    <div className="container mt-5">
      <h2>Manage Your Shop</h2>

      <div className="mb-4">
        <label>Shop Name</label>
        <input
          type="text"
          className="form-control"
          name="name"
          value={shop.name || ''}
          onChange={onInputChange}
        />
      </div>

      <div className="mb-4">
        <label>Shop ID</label>
        <input
          type="text"
          className="form-control"
          name="shopCode"
          value={shop.shopCode || ''}
          readOnly
          disabled
        />
      </div>

      <div className="mb-4">
        <label>About Shop</label>
        <textarea
          className="form-control"
          name="description"
          value={shop.description || ''}
          onChange={onInputChange}
          rows="3"
        />
      </div>

      <div className="mb-4">
        <label>Shop Location</label>
        <input
          type="text"
          className="form-control"
          name="location"
          value={shop.location || ''}
          onChange={onInputChange}
        />
      </div>

      <div className="mb-4">
        <label>Shop Banner</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) => onBannerUpload(e.target.files[0])}
          disabled={uploading}
        />
        {banner && (
          <img
            src={banner}
            alt="Shop Banner"
            className="img-fluid mt-2"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
          />
        )}
      </div>

      <button
        className="btn btn-success mb-5"
        onClick={onSave}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Save Shop Info'}
      </button>
    </div>
  );
}
