import { useEffect, useState } from 'react';
import ShopCard from '../components/ShopCard';
import api from '../services/api';

export default function ShopList() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    api.get('/')
      .then((res) => {
        console.log('Fetched shops:', res.data);
        setShops(res.data); // ✅ Fix here
      })
      .catch((err) => {
        console.error('Error fetching shops:', err.message);
      });
  }, []);

  return (
    <div className="container pt-5 mt-5 mb-5">
      <h2 className="text-center mb-4">Har Cheez Now Available Here.</h2>

      {shops.length === 0 ? (
        <div className="alert alert-info text-center">No shops found.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          {shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
