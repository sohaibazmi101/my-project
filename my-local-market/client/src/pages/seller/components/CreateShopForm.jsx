import React from 'react';

export default function CreateShopForm({
  newShopData,
  categories,
  uploading,
  creatingShop,
  onChange,
  onBannerUpload,
  onSubmit,
}) {
  return (
    <div className="container mt-5">
      <h2>Create Your Shop</h2>
      <form onSubmit={onSubmit}>

        <div className="mb-3">
          <label className="form-label">Shop Name</label>
          <input
            type="text"
            className="form-control"
            name="shopName"
            value={newShopData.shopName}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={newShopData.description}
            onChange={onChange}
            rows="3"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={newShopData.address}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-control"
            name="category"
            value={newShopData.category}
            onChange={onChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">WhatsApp Number</label>
          <input
            type="text"
            className="form-control"
            name="whatsapp"
            value={newShopData.whatsapp}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            type="text"
            className="form-control"
            name="location"
            value={newShopData.location}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Shop Banner (optional)</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => onBannerUpload(e.target.files[0])}
            disabled={uploading}
          />
          {newShopData.banner && (
            <img
              src={newShopData.banner}
              alt="Shop Banner"
              className="img-fluid mt-2"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={creatingShop || uploading}
        >
          {creatingShop ? 'Creating Shop...' : 'Create Shop'}
        </button>
      </form>
    </div>
  );
}
