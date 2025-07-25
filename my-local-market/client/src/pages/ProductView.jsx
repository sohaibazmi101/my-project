import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="card mx-auto" style={{ maxWidth: '800px' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="card-img-top img-fluid"
          style={{ objectFit: 'cover', maxHeight: '400px' }}
        />
        <div className="card-body">
          <h3 className="card-title">{product.name}</h3>
          <p className="card-text">{product.description}</p>
          <h5 className="text-primary">₹{product.price}</h5>
          <p className="text-muted">
            Availability: {product.availability ? "✅ In stock" : "❌ Out of stock"}
          </p>
          <a
            href={`https://wa.me/${product.whatsapp}`}
            className="btn btn-success"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
