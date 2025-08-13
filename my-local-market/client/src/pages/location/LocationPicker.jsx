import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

function LocationSearch({ onSelectLocation }) {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);

  // Fetch locations from Nominatim
  const fetchLocations = async (query) => {
    if (!query) {
      setResults([]);
      return;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=5`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'YourAppNameHere' // polite header (not mandatory)
        }
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Nominatim search error:', err);
      setResults([]);
    }
  };

  // Handle input change
  const onChange = (e) => {
    setSearchText(e.target.value);
    fetchLocations(e.target.value);
  };

  // On selecting a location from results
  const handleSelect = (loc) => {
    setSearchText(loc.display_name);
    setResults([]);
    onSelectLocation({
      lat: parseFloat(loc.lat),
      lng: parseFloat(loc.lon),
    });
  };

  return (
    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
      <input
        type="text"
        placeholder="Search location..."
        value={searchText}
        onChange={onChange}
        style={{ width: '100%', padding: '0.5rem' }}
      />
      {results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            zIndex: 1000,
            background: 'white',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            maxHeight: 150,
            overflowY: 'auto',
            border: '1px solid #ccc',
            width: '100%',
          }}
        >
          {results.map((loc) => (
            <li
              key={loc.place_id}
              onClick={() => handleSelect(loc)}
              style={{ padding: '0.5rem', cursor: 'pointer' }}
            >
              {loc.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

function LocationPicker({ latitude, longitude, setLatitude, setLongitude }) {
  const [position, setPosition] = useState(null);

  // Whenever props change, update position state
  useEffect(() => {
    if (latitude != null && longitude != null) {
      setPosition([latitude, longitude]);
      return;
    }

    // fallback to current location or default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setPosition([lat, lng]);
          setLatitude(lat);
          setLongitude(lng);
        },
        () => {
          setPosition([51.505, -0.09]);
          setLatitude(51.505);
          setLongitude(-0.09);
        }
      );
    } else {
      setPosition([51.505, -0.09]);
      setLatitude(51.505);
      setLongitude(-0.09);
    }
  }, [latitude, longitude, setLatitude, setLongitude]);

  // When a location is selected from search dropdown
  const onSelectLocation = ({ lat, lng }) => {
    setPosition([lat, lng]);
    setLatitude(lat);
    setLongitude(lng);
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
      },
    });

    if (!position) return null;

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

  if (!position) {
    return <div>Loading map...</div>;
  }

  return (
    <>
      <LocationSearch onSelectLocation={onSelectLocation} />
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '300px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ChangeMapView center={position} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </>
  );
}

export default LocationPicker;
