import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

function LocationPicker({ latitude, longitude, setLatitude, setLongitude, searchCenter }) {
  const defaultPosition = [latitude || 51.505, longitude || -0.09];
  const [position, setPosition] = useState(defaultPosition);

  // Update position if searchCenter changes
  useEffect(() => {
    if (searchCenter) {
      setPosition(searchCenter);
      setLatitude(searchCenter[0]);
      setLongitude(searchCenter[1]);
    }
  }, [searchCenter, setLatitude, setLongitude]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
      },
    });

    return (
      <Marker
        draggable={true}
        position={position}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const latlng = marker.getLatLng();
            setPosition([latlng.lat, latlng.lng]);
            setLatitude(latlng.lat);
            setLongitude(latlng.lng);
          },
        }}
      />
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: '300px', width: '100%', marginBottom: '1rem' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
      <MapUpdater center={position} />
    </MapContainer>
  );
}

export default function ShopInfoForm({
  shop,
  banner,
  uploading,
  onInputChange,
  onBannerUpload,
  onSave,
  setShop,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCenter, setSearchCenter] = useState(null);
  const setLatitude = (lat) => setShop(prev => ({ ...prev, latitude: lat }));
  const setLongitude = (lng) => setShop(prev => ({ ...prev, longitude: lng }));

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      // Call Nominatim API for geocoding
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
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

      {/* Map location picker */}
      <div className="mb-4">
        <label>Shop Location - Select on Map</label>
        <LocationPicker
          latitude={shop.latitude}
          longitude={shop.longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          searchCenter={searchCenter}
        />
        {shop.latitude && shop.longitude && (
          <p>
            Selected Coordinates: {shop.latitude.toFixed(5)}, {shop.longitude.toFixed(5)}
          </p>
        )}
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
