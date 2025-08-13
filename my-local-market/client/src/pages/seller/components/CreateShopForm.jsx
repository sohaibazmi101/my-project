import React, { useState, useEffect } from 'react';
import LocationPicker from '../../location/LocationPicker';

export default function CreateShopForm({
  newShopData,
  categories,
  uploading,
  creatingShop,
  onChange,
  onBannerUpload,
  onSubmit,
  setNewShopData,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCenter, setSearchCenter] = useState(null);

  const setLatitude = (lat) =>
    setNewShopData((prev) => ({ ...prev, latitude: lat }));
  const setLongitude = (lng) =>
    setNewShopData((prev) => ({ ...prev, longitude: lng }));

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setSearchCenter([lat, lon]);
        setLatitude(lat);
        setLongitude(lon);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Failed to search location');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create Your Shop</h2>
      <form onSubmit={onSubmit}>
        {/* Shop Name */}
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

        {/* Description */}
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

        {/* Address */}
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

        {/* Category */}
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
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* WhatsApp Number */}
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

        {/* Location picker */}
        <div className="mb-3">
          <label className="form-label">Select Shop Location on Map</label>
          <LocationPicker
            latitude={newShopData.latitude}
            longitude={newShopData.longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
            searchCenter={searchCenter}
          />
          {newShopData.latitude && newShopData.longitude && (
            <p>
              Selected Coordinates: {newShopData.latitude.toFixed(5)},{' '}
              {newShopData.longitude.toFixed(5)}
            </p>
          )}
        </div>

        {/* Shop Banner */}
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
