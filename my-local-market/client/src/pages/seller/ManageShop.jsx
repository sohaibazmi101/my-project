import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProductCardForSeller from '../../components/ProductCardForSeller';

export default function ManageShop() {
  const [shop, setShop] = useState(undefined); // undefined = loading, null = no shop
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creatingShop, setCreatingShop] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fields for creating a new shop
  const [newShopData, setNewShopData] = useState({
    shopName: '',
    description: '',
    address: '',
    category: '',
    whatsapp: '',
    location: '',
    banner: '',
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchShop();
    fetchCategories();
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

      if (!shop) {
        setShop(null); // No shop yet
        setProducts([]);
        setBanner('');
        return;
      }

      shop.featuredProducts = (shop.featuredProducts || []).map(id => id.toString());
      shop.newProducts = (shop.newProducts || []).map(id => id.toString());

      const normalizedProducts = (products || []).map(p => ({
        ...p,
        _id: p._id.toString()
      }));

      setShop(shop);
      setProducts(normalizedProducts);
      setBanner(shop.banner || '');

    } catch (err) {
      console.error('Failed to fetch shop data:', err);
      alert('Failed to load shop data');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  // Create new shop handlers
  const handleCreateShopChange = (e) => {
    const { name, value } = e.target;
    setNewShopData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateShopSubmit = async (e) => {
    e.preventDefault();
    setCreatingShop(true);
    try {
      const payload = {
        sellerId: JSON.parse(atob(token.split('.')[1])).id, // decode sellerId from JWT token
        shopName: newShopData.shopName,
        description: newShopData.description,
        address: newShopData.address,
        category: newShopData.category,
        whatsapp: newShopData.whatsapp,
        location: newShopData.location,
        banner: newShopData.banner,
      };
      const res = await api.post('/customers/create-shop', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Shop created successfully!');
      fetchShop();
    } catch (err) {
      console.error('Create shop error:', err);
      alert('Failed to create shop');
    } finally {
      setCreatingShop(false);
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

      if (shop) {
        setShop(prev => ({ ...prev, banner: imageUrl }));
      } else {
        setNewShopData(prev => ({ ...prev, banner: imageUrl }));
      }

      alert('Banner uploaded!');
    } catch (err) {
      console.error('Banner upload error:', err);
      alert('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  // Existing handlers (handleInputChange, handleShopSave, toggleProductFlag, handleDeleteProduct, handleEditProduct)

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
      fetchShop();
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
      fetchShop();
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${productId}/delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product deleted');
      fetchShop();
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Failed to delete product');
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/seller/products/edit/${productId}`);
  };

  // --- UI ---

  if (shop === undefined) {
    return <div className="text-center mt-5">Loading shop...</div>;
  }

  if (shop === null) {
    // Create shop form with category select dropdown
    return (
      <div className="container mt-5">
        <h2>Create Your Shop</h2>
        <form onSubmit={handleCreateShopSubmit}>

          <div className="mb-3">
            <label className="form-label">Shop Name</label>
            <input
              type="text"
              className="form-control"
              name="shopName"
              value={newShopData.shopName}
              onChange={handleCreateShopChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={newShopData.description}
              onChange={handleCreateShopChange}
              rows="3"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={newShopData.address}
              onChange={handleCreateShopChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              name="category"
              value={newShopData.category}
              onChange={handleCreateShopChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">WhatsApp Number</label>
            <input
              type="text"
              className="form-control"
              name="whatsapp"
              value={newShopData.whatsapp}
              onChange={handleCreateShopChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              name="location"
              value={newShopData.location}
              onChange={handleCreateShopChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Shop Banner (optional)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => handleBannerUpload(e.target.files[0])}
              disabled={uploading}
            />
            {newShopData.banner && (
              <img
                src={newShopData.banner}
                alt="Shop Banner"
                className="img-fluid mt-2"
                style={{ maxHeight: '200px', objectFit: 'cover' }}
              />
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={creatingShop || uploading}
          >
            {creatingShop ? 'Creating Shop...' : 'Create Shop'}
          </button>
        </form>
      </div>
    );
  }

  // Manage shop UI when shop exists
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
            <div key={product._id} className="col-6 col-md-4 mb-3">
              <ProductCardForSeller
                product={product}
                isFeatured={shop.featuredProducts.includes(product._id.toString())}
                isNew={shop.newProducts.includes(product._id.toString())}
                onToggleFeatured={(id) => toggleProductFlag(id, 'featured')}
                onToggleNew={(id) => toggleProductFlag(id, 'new')}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
