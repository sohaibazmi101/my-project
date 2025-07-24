import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ShopDetails() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get(`/shops/${id}`)
      .then(res => {
        setShop(res.data.shop);
        setProducts(res.data.products);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!shop) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>{shop.name}</h2>
      <p>{shop.address} · {shop.phone}</p>
      <h4>Products</h4>
      <div className="row">
        {products.map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
