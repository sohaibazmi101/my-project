import { useEffect, useState } from 'react';
import api from '../services/api';
import ShopCard from '../components/ShopCard'; // Make sure this exists

export default function ShopList() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    api.get('/shops')
      .then((res) => {
        console.log('Fetched shops:', res.data); // log the response
        setShops(res.data);
      })
      .catch((err) => {
        console.error('Error fetching shops:', err.message);
      });
  }, []);

  return (
    <div className="container mt-4">
      <h2>All Shops</h2>
      <div className="row">
        {shops.length === 0 ? (
          <p>No shops found.</p>
        ) : (
          shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))
        )}
      </div>
    </div>
  );
}
