import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ManageShop() {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState('');
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const res = await api.get('/sellers/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const shop = res.data.shop;
      const products = res.data.products;

      // Normalize ID types for comparison
      shop.featuredProducts = (shop.featuredProducts || []).map(id => id.toString());
      shop.newProducts = (shop.newProducts || []).map(id => id.toString());
      const normalizedProducts = (products || []).map(p => ({
        ...p,
        _id: p._id.toString()
      }));

      setShop(shop);
      setProducts(normalizedProducts);
      setBanner(shop.banner || '');

      console.log('Loaded shop:', shop);

    } catch (err) {
      console.error('Failed to fetch shop data:', err);
    }
  };





  const handleBannerUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('banner', file);

    try {
      const res = await api.post('/shops/banner/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const imageUrl = res.data.imageUrl;
      setBanner(imageUrl);
      alert('Banner uploaded!');
    } catch (err) {
      console.error('Banner upload error:', err);
      alert('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShop((prev) => ({ ...prev, [name]: value }));
  };

  const handleShopSave = async () => {
    try {
      await api.put(`/shops/${shop._id}/update`, {
        name: shop.name,
        description: shop.description,
        location: shop.location,
        banner
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Shop updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update shop');
    }
  };

  const toggleProductFlag = async (productId, field) => {
    const idStr = productId.toString();
    const fieldKey = field === 'featured' ? 'featuredProducts' : 'newProducts';
    const updatedShop = { ...shop };

    if (updatedShop[fieldKey].includes(idStr)) {
      updatedShop[fieldKey] = updatedShop[fieldKey].filter(id => id !== idStr);
    } else {
      updatedShop[fieldKey] = [...updatedShop[fieldKey], idStr];
    }

    setShop(updatedShop);

    try {
      await api.patch(`/shops/${shop._id}/product/${idStr}/toggle-${field}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      alert(`Failed to toggle ${field}`);
      console.error(`Failed to toggle ${field}:`, err);
      fetchShop(); // fallback in case toggle fails
    }
  };




  if (!shop) return <div className="text-center mt-5">Loading shop...</div>;

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
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label>About Shop</label>
        <textarea
          className="form-control"
          name="description"
          value={shop.description || ''}
          onChange={handleInputChange}
          rows="3"
        />
      </div>

      <div className="mb-4">
        <label>Shop Location</label>
        <input
          type="text"
          className="form-control"
          name="location"
          value={shop.location || ''}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label>Shop Banner</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) => handleBannerUpload(e.target.files[0])}
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

      <button className="btn btn-success mb-5" onClick={handleShopSave} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Save Shop Info'}
      </button>

      <hr />

      <h4>Your Products</h4>
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="row">
          {products.map((product) => (
            <div className="col-md-4 mb-3" key={product._id}>
              <div className="card h-100">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="card-img-top"
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5>{product.name}</h5>
                  <p>₹{product.price}</p>

                  {/* Featured Button */}
                  {shop.featuredProducts.includes(product._id.toString()) ? (
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => toggleProductFlag(product._id, 'featured')}
                    >
                      Unmark Featured
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning btn-sm me-2"
                      onClick={() => toggleProductFlag(product._id, 'featured')}
                    >
                      Mark as Featured
                    </button>
                  )}

                  {/* New Button */}
                  {shop.newProducts.includes(product._id.toString()) ? (
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => toggleProductFlag(product._id, 'new')}
                    >
                      Unmark New
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={() => toggleProductFlag(product._id, 'new')}
                    >
                      Mark as New
                    </button>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
