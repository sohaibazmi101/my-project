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

  if (!shop) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5 mb-5">

      {/* Shop Banner */}
      {shop.bannerImage && (
        <div className="mb-4">
          <img
            src={shop.bannerImage}
            alt={`${shop.name} banner`}
            className="img-fluid rounded"
            style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
          />
        </div>
      )}

      <div className="text-center mb-4">
        <h2>{shop.name}</h2>
        <p className="text-muted">{shop.address} · 📞 {shop.phone}</p>
        {shop.whatsapp && (
          <a
            href={`https://wa.me/${shop.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-success"
          >
            Chat on WhatsApp
          </a>
        )}
      </div>

      <h4 className="mb-3">Products</h4>
      {products.length === 0 ? (
        <div className="alert alert-info">No products listed yet for this shop.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          {products.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
