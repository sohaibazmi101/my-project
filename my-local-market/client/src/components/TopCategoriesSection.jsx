import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SmallProductCard from './SmallProductCard';

export default function TopCategoriesSection() {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopCategoriesAndProducts = async () => {
            try {
                // Step 1: Fetch only the top 5 categories
                const categoriesRes = await api.get('/categories/top-with-products');
                const topCategories = categoriesRes.data;
                setCategories(topCategories);

                // Step 2: Fetch products for each category in parallel
                const productPromises = topCategories.map((cat) =>
                    // Use a dedicated backend endpoint for a random sample
                    api.get(`/products/category/${cat._id}/random`)
                );
                const results = await Promise.all(productPromises);

                // Step 3: Map the products to their respective categories
                const mappedProducts = {};
                topCategories.forEach((cat, i) => {
                    mappedProducts[cat._id] = results[i].data;
                });
                setProductsByCategory(mappedProducts);

            } catch (err) {
                console.error('Failed to fetch top categories or products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopCategoriesAndProducts();
    }, []);

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {categories.map((cat) => (
                <div
                    key={cat._id}
                    style={{
                        background: 'linear-gradient(to bottom, #50ef75ff, #f6fff8)',
                        borderRadius: '8px',
                        padding: '1rem',
                        paddingBottom: '0.5rem',
                        marginTop: '1rem'
                    }}
                >
                    <h5 className="mb-2 d-flex align-items-center">
                        <i className={`bi ${cat.icon} me-2`}></i>
                        <span>{cat.name}</span>
                    </h5>
                    <div
                        className="scroll-container pb-1 d-flex hide-scroll"
                        style={{
                            gap: '0.5rem',
                            overflowX: 'auto',
                            paddingBottom: '0.5rem'
                        }}
                    >
                        {productsByCategory[cat._id]?.length > 0 ? (
                            productsByCategory[cat._id].map((product) => (
                                <div key={product._id} style={{ flex: '0 0 auto' }}>
                                    <SmallProductCard product={product} quantity={1} showQuantity={false} />
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No products in this category yet</p>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}