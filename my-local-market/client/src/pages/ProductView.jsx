import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/shops/${product?.sellerId}`) // not ideal; in real app, use dedicated endpoint
      .then(res => {
        const all = res.data.products;
        const p = all.find(item => item._id === id);
        setProduct(p);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>{product.name}</h2>
      <img src={product.imageUrl} alt={product.name} className="img-fluid mb-3" />
      <p>{product.description}</p>
      <h4>₹{product.price}</h4>
      <p>Available: {product.availability ? "Yes" : "No"}</p>
      <a href={`https://wa.me/${product.whatsapp}`} className="btn btn-success" target="_blank">
        Contact via WhatsApp
      </a>
    </div>
  );
}
