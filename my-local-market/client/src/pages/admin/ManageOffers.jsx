import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ManageOffers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    isActive: false,
    percentage: 0,
    previousPrice: '',
    validFrom: '',
    validTill: '',
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setProducts(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  function openOfferForm(product) {
    setSelectedProduct(product);
    setFormData({
      isActive: product.offer?.isActive || false,
      percentage: product.offer?.percentage || 0,
      previousPrice: product.offer?.previousPrice || product.price || '',
      validFrom: product.offer?.validFrom ? product.offer.validFrom.slice(0, 10) : '',
      validTill: product.offer?.validTill ? product.offer.validTill.slice(0, 10) : '',
    });
    setError(null);
  }

  function closeOfferForm() {
    setSelectedProduct(null);
    setError(null);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      let updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Auto-update price based on percentage
      if (name === 'percentage' && selectedProduct) {
        const originalPrice = selectedProduct.price;
        const discount = (originalPrice * value) / 100;
        updated.previousPrice = originalPrice;
        updated.calculatedPrice = originalPrice - discount;
      }

      return updated;
    });
  }

  async function handleSaveOffer(e) {
    e.preventDefault();
    setError(null);

    const { isActive, percentage, previousPrice, validFrom, validTill } = formData;
    if (isActive) {
      if (percentage < 0 || percentage > 100) {
        setError('Percentage must be between 0 and 100');
        return;
      }
      if (!previousPrice || isNaN(previousPrice) || Number(previousPrice) <= 0) {
        setError('Previous price must be a positive number');
        return;
      }
      if (validFrom && validTill && validFrom > validTill) {
        setError('Valid From date must be before Valid Till date');
        return;
      }
    }

    setSaving(true);
    try {
      const originalPrice = selectedProduct.price;
      const discount = (originalPrice * percentage) / 100;
      const newPrice = originalPrice - discount;

      const body = {
        price: isActive ? newPrice : originalPrice, // update price directly
        offer: isActive
          ? {
              isActive,
              percentage: Number(percentage),
              previousPrice: Number(originalPrice),
              validFrom: validFrom ? new Date(validFrom).toISOString() : null,
              validTill: validTill ? new Date(validTill).toISOString() : null,
            }
          : {
              isActive: false,
              percentage: 0,
              previousPrice: null,
              validFrom: null,
              validTill: null,
            },
      };

      await api.put(
        `/products/${selectedProduct._id}/edit`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      await fetchProducts();
      closeOfferForm();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredProducts = products.filter((p) =>
    p.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Manage Product Offers</h2>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Product Code"
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p>Loading products...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-light">
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Offer Active</th>
              <th>Offer %</th>
              <th>Previous Price (₹)</th>
              <th>Valid From</th>
              <th>Valid Till</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center">
                  No products found.
                </td>
              </tr>
            )}
            {filteredProducts.map((prod) => (
              <tr key={prod._id}>
                <td>{prod.productCode}</td>
                <td>{prod.name}</td>
                <td>{prod.category}</td>
                <td>{prod.price.toFixed(2)}</td>
                <td>{prod.offer?.isActive ? 'Yes' : 'No'}</td>
                <td>{prod.offer?.percentage ?? '-'}</td>
                <td>{prod.offer?.previousPrice ?? '-'}</td>
                <td>
                  {prod.offer?.validFrom
                    ? new Date(prod.offer.validFrom).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  {prod.offer?.validTill
                    ? new Date(prod.offer.validTill).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => openOfferForm(prod)}
                  >
                    Edit Offer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Offer Edit Modal */}
      {selectedProduct && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog" role="document">
            <form className="modal-content" onSubmit={handleSaveOffer}>
              <div className="modal-header">
                <h5 className="modal-title">
                  Edit Offer - {selectedProduct.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeOfferForm}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="isActive"
                  >
                    Offer Active
                  </label>
                </div>

                <div className="mb-3">
                  <label htmlFor="percentage" className="form-label">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="percentage"
                    name="percentage"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={handleChange}
                    disabled={!formData.isActive}
                    required={formData.isActive}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Calculated Price (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={
                      selectedProduct
                        ? (selectedProduct.price - (selectedProduct.price * formData.percentage) / 100).toFixed(2)
                        : ''
                    }
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="validFrom" className="form-label">
                    Valid From
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="validFrom"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleChange}
                    disabled={!formData.isActive}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="validTill" className="form-label">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="validTill"
                    name="validTill"
                    value={formData.validTill}
                    onChange={handleChange}
                    disabled={!formData.isActive}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeOfferForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
