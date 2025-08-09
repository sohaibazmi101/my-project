import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ManageTopSellers() {
  const [allShops, setAllShops] = useState([]);
  const [featuredShops, setFeaturedShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all shops and the current featured shops on component load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allShopsRes, featuredShopsRes] = await Promise.all([
          api.get('/admin/shops/all', {
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
          }),
          api.get('/shops/featured') // This is the public endpoint and does not require a token
        ]);
        setAllShops(allShopsRes.data);
        setFeaturedShops(featuredShopsRes.data);
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handler to move a shop from the 'all shops' list to the 'featured' list
  const handleAddFeatured = (shop) => {
    // Check if the shop is already featured
    const isAlreadyFeatured = featuredShops.some(
      (featuredShop) => featuredShop._id === shop._id
    );
    if (!isAlreadyFeatured) {
      setFeaturedShops([...featuredShops, shop]);
    }
  };

  // Handler to remove a shop from the 'featured' list
  const handleRemoveFeatured = (shopId) => {
    setFeaturedShops(featuredShops.filter((shop) => shop._id !== shopId));
  };

  // Handler to move a shop up in the featured list order
  const handleMoveUp = (index) => {
    if (index > 0) {
      const newFeaturedShops = [...featuredShops];
      const shopToMove = newFeaturedShops[index];
      newFeaturedShops[index] = newFeaturedShops[index - 1];
      newFeaturedShops[index - 1] = shopToMove;
      setFeaturedShops(newFeaturedShops);
    }
  };

  // Handler to move a shop down in the featured list order
  const handleMoveDown = (index) => {
    if (index < featuredShops.length - 1) {
      const newFeaturedShops = [...featuredShops];
      const shopToMove = newFeaturedShops[index];
      newFeaturedShops[index] = newFeaturedShops[index + 1];
      newFeaturedShops[index + 1] = shopToMove;
      setFeaturedShops(newFeaturedShops);
    }
  };

  // Handler to save the final featured list order to the backend
  const handleSave = async () => {
  setIsSaving(true);
  try {
    const featuredShopIds = featuredShops.map((shop) => shop._id);
    const token = localStorage.getItem('adminToken'); // Get the admin token

    if (!token) {
      alert('You are not authorized. Please log in as an admin.');
      setIsSaving(false);
      return;
    }

    await api.post(
      '/admin/shops/featured',
      { featuredShopIds },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      }
    );

    alert('Top Sellers updated successfully!');
  } catch (error) {
    console.error('Failed to save featured shops:', error);
    alert('Failed to save changes.');
  } finally {
    setIsSaving(false);
  }
};

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4">⭐ Manage Top Sellers</h3>
      <p className="mb-4 text-muted">
        Select shops from the list on the left and add them to the 'Top Sellers' list. Use the arrows to set their position.
      </p>

      <div className="row">
        {/* All Shops List */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <strong>All Shops ({allShops.length})</strong>
            </div>
            <ul className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {allShops.map((shop) => (
                <li key={shop._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{shop.name}</span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddFeatured(shop)}
                    disabled={featuredShops.some(
                      (featuredShop) => featuredShop._id === shop._id
                    )}
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Featured Shops List */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <strong>Top Sellers ({featuredShops.length})</strong>
              <small className="float-end">Max 20</small>
            </div>
            <ul className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {featuredShops.length === 0 ? (
                <li className="list-group-item text-center text-muted">No shops added yet.</li>
              ) : (
                featuredShops.map((shop, index) => (
                  <li key={shop._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-secondary me-2">{index + 1}</span>
                      <span>{shop.name}</span>
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === featuredShops.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveFeatured(shop._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-lg btn-success"
          onClick={handleSave}
          disabled={isSaving || featuredShops.length === 0}
        >
          {isSaving ? 'Saving...' : 'Save Top Sellers'}
        </button>
      </div>
    </div>
  );
}