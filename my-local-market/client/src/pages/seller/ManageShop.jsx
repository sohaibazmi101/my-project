import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import CreateShopForm from './components/CreateShopForm';
import ShopInfoForm from './components/ShopInfoForm';
import ProductList from './components/ProductList';

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
    latitude: null,    // Added latitude
    longitude: null,   // Added longitude
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchShop();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch existing shop and products for the logged in seller
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

      // Normalize product IDs to strings for comparison
      shop.featuredProducts = (shop.featuredProducts || []).map(id => id.toString());
      shop.newProducts = (shop.newProducts || []).map(id => id.toString());

      // Normalize lat/lng to null if missing
      shop.latitude = shop.latitude ?? null;
      shop.longitude = shop.longitude ?? null;

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

  // Fetch available categories for shop creation
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  // Handle changes in the create shop form
  const handleCreateShopChange = (e) => {
    const { name, value } = e.target;
    setNewShopData(prev => ({ ...prev, [name]: value }));
  };

  // Submit handler for creating new shop
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
        banner: newShopData.banner,
        latitude: newShopData.latitude,
        longitude: newShopData.longitude,
      };
      const res = await api.post('/sellers/create-shop', payload, {
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

  // Handle banner image upload (both create and manage shop)
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

  // Handle input changes in manage existing shop form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShop((prev) => ({ ...prev, [name]: value }));
  };

  // Save shop info update
  const handleShopSave = async () => {
    try {
      await api.put(`/shops/${shop._id}/update`, {
        name: shop.name,
        description: shop.description,
        banner,
        latitude: shop.latitude,
        longitude: shop.longitude,
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

  // Toggle featured or new product flags
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

  // Delete a product
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

  // Navigate to edit product page
  const handleEditProduct = (productId) => {
    navigate(`/seller/products/edit/${productId}`);
  };

  // --- UI ---

  if (shop === undefined) {
    return <div className="text-center mt-5">Loading shop...</div>;
  }

  if (shop === null) {
    // Render Create Shop Form component with props
    return (
      <CreateShopForm
        newShopData={newShopData}
        categories={categories}
        uploading={uploading}
        creatingShop={creatingShop}
        onChange={handleCreateShopChange}
        onBannerUpload={handleBannerUpload}
        onSubmit={handleCreateShopSubmit}
        setNewShopData={setNewShopData}
      />
    );
  }

  // Render Manage Shop and Product List components
  return (
    <>
      <ShopInfoForm
        shop={shop}
        banner={banner}
        uploading={uploading}
        onInputChange={handleInputChange}
        onBannerUpload={handleBannerUpload}
        onSave={handleShopSave}
        setShop={setShop}
      />

      <hr />

      <div className="container">
        <h4>Your Products</h4>
        <ProductList
          products={products}
          featuredProducts={shop.featuredProducts}
          newProducts={shop.newProducts}
          onToggleFeatured={(id) => toggleProductFlag(id, 'featured')}
          onToggleNew={(id) => toggleProductFlag(id, 'new')}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </div>
    </>
  );
}
