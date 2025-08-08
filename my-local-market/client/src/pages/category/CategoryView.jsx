import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import SmallProductCard from '../../components/SmallProductCard';

export default function CategoryView() {
  const { categoryId } = useParams();
  const [categoryName, setCategoryName] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // Fetch category details (optional, for category name)
        const categoriesRes = await api.get('/categories');
        const category = categoriesRes.data.find(c => c._id === categoryId);
        setCategoryName(category?.name || 'Category');

        // Fetch products of this category
        const productsRes = await api.get(`/products/category/${encodeURIComponent(category?.name || '')}`);
        setProducts(productsRes.data);
      } catch (err) {
        console.error('Failed to load category or products', err);
        setCategoryName('Category');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId]);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="container mt-4">
      <h3>Products in "{categoryName}"</h3>
      {products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {products.map((product) => (
            <SmallProductCard
              key={product._id}
              product={product}
              quantity={1}
              showQuantity={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
