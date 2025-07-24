import { useEffect, useState } from 'react';
import api from '../services/api';
import ShopCard from '../components/ShopCard';

export default function Home() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    api.get('/shops')
      .then(res => setShops(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Featured Shops</h2>
      <div className="row">
        {shops.map(shop => (
          <ShopCard key={shop._id} shop={shop} />
        ))}
      </div>
    </div>
  );
}
