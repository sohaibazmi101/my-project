import React, { useEffect, useState } from 'react';

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

  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
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
      validFrom: product.offer?.validFrom ? product.offer.validFrom.slice(0,10) : '',
      validTill: product.offer?.validTill ? product.offer.validTill.slice(0,10) : '',
    });
    setError(null);
  }

  function closeOfferForm() {
    setSelectedProduct(null);
    setError(null);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSaveOffer(e) {
    e.preventDefault();
    setError(null);

    // Basic validation
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
      if (Number(previousPrice) <= selectedProduct.price) {
        setError('Previous price should be greater than current price');
        return;
      }
      if (validFrom && validTill && validFrom > validTill) {
        setError('Valid From date must be before Valid Till date');
        return;
      }
    }

    setSaving(true);
    try {
      const body = {
        offer: {
          isActive,
          percentage: Number(percentage),
          previousPrice: Number(previousPrice),
          validFrom: validFrom ? new Date(validFrom).toISOString() : null,
          validTill: validTill ? new Date(validTill).toISOString() : null,
        },
      };

      // If offer disabled, clear all offer fields
      if (!isActive) {
        body.offer = {
          isActive: false,
          percentage: 0,
          previousPrice: null,
          validFrom: null,
          validTill: null,
        };
      }

      const res = await fetch(`/api/products/${selectedProduct._id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save offer');
      }

      // Refresh products list
      await fetchProducts();
      closeOfferForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mt-4">
      <h2>Manage Product Offers</h2>

      {loading && <p>Loading products...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-light">
            <tr>
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
            {products.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center">No products found.</td>
              </tr>
            )}
            {products.map((prod) => (
              <tr key={prod._id}>
                <td>{prod.name}</td>
                <td>{prod.category}</td>
                <td>{prod.price.toFixed(2)}</td>
                <td>{prod.offer?.isActive ? 'Yes' : 'No'}</td>
                <td>{prod.offer?.percentage ?? '-'}</td>
                <td>{prod.offer?.previousPrice ?? '-'}</td>
                <td>{prod.offer?.validFrom ? new Date(prod.offer.validFrom).toLocaleDateString() : '-'}</td>
                <td>{prod.offer?.validTill ? new Date(prod.offer.validTill).toLocaleDateString() : '-'}</td>
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
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <form className="modal-content" onSubmit={handleSaveOffer}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Offer - {selectedProduct.name}</h5>
                <button type="button" className="btn-close" onClick={closeOfferForm} aria-label="Close" />
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
                  <label className="form-check-label" htmlFor="isActive">Offer Active</label>
                </div>

                <div className="mb-3">
                  <label htmlFor="percentage" className="form-label">Discount Percentage (%)</label>
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
                  <label htmlFor="previousPrice" className="form-label">Previous Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="previousPrice"
                    name="previousPrice"
                    min="0"
                    step="0.01"
                    value={formData.previousPrice}
                    onChange={handleChange}
                    disabled={!formData.isActive}
                    required={formData.isActive}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="validFrom" className="form-label">Valid From</label>
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
                  <label htmlFor="validTill" className="form-label">Valid Till</label>
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
                <button type="button" className="btn btn-secondary" onClick={closeOfferForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
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
