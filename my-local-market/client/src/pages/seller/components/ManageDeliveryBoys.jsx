import { useEffect, useState } from 'react';
import api from '../../../services/api';

export default function ManageDeliveryBoys() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [shop, setShop] = useState(null);
  const [selectedBoys, setSelectedBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  // Fetch shop info including assigned delivery boys
  const fetchShop = async () => {
    try {
      const res = await api.get('/seller/shop', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shopData = res.data.shop;

      setShop(shopData);

      // Get assigned delivery boy IDs safely
      const assignedIds = (shopData.assignedDeliveryBoys || []).map(
        b => (b._id ? b._id : b.toString())
      );
      console.log('Data from Backend: ', assignedIds);
      setSelectedBoys(assignedIds);
    } catch (err) {
      console.error('Failed to fetch shop:', err);
    }
  };

  // Fetch all delivery boys
  const fetchDeliveryBoys = async () => {
    try {
      const res = await api.get('/delivery/deliveryboy/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveryBoys(res.data.deliveryBoys || []);
    } catch (err) {
      console.error('Failed to fetch delivery boys:', err);
      alert(err.response?.data?.message || 'Failed to fetch delivery boys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
    fetchDeliveryBoys();
  }, []);

  const handleSelect = (id) => {
    setSelectedBoys(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!selectedBoys.length) return alert('Select at least one delivery boy');
    if (!shop) return alert('Shop data not loaded yet');

    try {
      await api.post(
        '/assign-db',
        { 
          deliveryBoyIds: selectedBoys, 
          shopId: shop._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Delivery boys assigned successfully!');
      fetchShop(); // refresh assigned delivery boys
    } catch (err) {
      console.error('Failed to assign delivery boys:', err);
      alert(err.response?.data?.message || 'Failed to assign delivery boys');
    }
  };

  const handleRemoveAssigned = async (boyId) => {
    if (!shop) return;
    try {
      // Call backend to remove delivery boy from assigned list
      await api.post(
        '/remove-assigned-db',
        { shopId: shop._id, deliveryBoyId: boyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Update frontend state
      setSelectedBoys(prev => prev.filter(id => id !== boyId));
      setShop(prev => ({
        ...prev,
        assignedDeliveryBoys: prev.assignedDeliveryBoys.filter(
          b => (b._id || b.toString()) !== boyId
        ),
      }));
  
      setMessage('Delivery boy removed successfully!');
    } catch (err) {
      console.error('Failed to remove delivery boy:', err);
      alert(err.response?.data?.message || 'Failed to remove delivery boy');
    }
  };
  

  if (loading) return <p>Loading...</p>;
  if (!shop) return <p>Loading shop info...</p>;

  // Make assigned delivery boys unique and ensure a key is always available
  const uniqueAssigned = [
    ...new Map((shop.assignedDeliveryBoys || []).map(b => [(b._id || b.toString()), b])).values()
  ];

  return (
    <div className="container mt-4">
      <h3>Manage Delivery Boys for {shop.name}</h3>
      {message && <p className="text-success">{message}</p>}

      {/* Section 1: Already assigned delivery boys */}
<div className="mb-4">
  <h5>Assigned Delivery Boys:</h5>
  {uniqueAssigned.length ? (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {uniqueAssigned.map(boy => (
          <tr key={boy._id || boy.toString()}>
            <td>{boy.name || 'Unknown'}</td>
            <td>{boy.phone || '-'}</td>
            <td>{boy.email || '-'}</td>
            <td>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleRemoveAssigned(boy._id)}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No delivery boys assigned yet.</p>
  )}
</div>


      {/* Section 2: Assign new delivery boys */}
      <div className="card">
        <div className="card-body">
          {deliveryBoys.length ? (
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {deliveryBoys.map(boy => (
                  <tr key={boy._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedBoys.includes(boy._id)}
                        onChange={() => handleSelect(boy._id)}
                      />
                    </td>
                    <td>{boy.name}</td>
                    <td>{boy.phone}</td>
                    <td>{boy.email || '-'}</td>
                    <td>{boy.isActive ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No delivery boys found.</p>
          )}
          <button className="btn btn-primary mt-2" onClick={handleAssign}>
            Assign Selected Delivery Boys
          </button>
        </div>
      </div>
    </div>
  );
}
