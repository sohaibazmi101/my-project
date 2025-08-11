import React from 'react';
import ProductCardForSeller from '../../../components/ProductCardForSeller';

export default function ProductList({
  products,
  featuredProducts,
  newProducts,
  onToggleFeatured,
  onToggleNew,
  onEdit,
  onDelete,
}) {
  if (products.length === 0) return <p>No products found</p>;

  return (
    <div className="row">
      {products.map((product) => (
        <div key={product._id} className="col-6 col-md-4 mb-3">
          <ProductCardForSeller
            product={product}
            isFeatured={featuredProducts.includes(product._id.toString())}
            isNew={newProducts.includes(product._id.toString())}
            onToggleFeatured={onToggleFeatured}
            onToggleNew={onToggleNew}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
