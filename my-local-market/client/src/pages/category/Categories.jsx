import { useEffect, useState } from 'react';
import api from '../../services/api';
import SmallProductCard from '../../components/SmallProductCard';
import CategoryCard from '../../components/CategoryCard';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('foryou');
    const [productsByCategory, setProductsByCategory] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
                const promises = res.data.map((cat) =>
                    api.get(`/products/category/${encodeURIComponent(cat.name)}`)
                );

                const results = await Promise.all(promises);
                const mapped = {};
                res.data.forEach((cat, i) => {
                    mapped[cat._id] = results[i].data;
                });

                setProductsByCategory(mapped);
            } catch (err) {
                console.error('Failed to fetch categories or products', err);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            if (activeCategory === 'foryou') return;

            const selectedCat = categories.find((c) => c._id === activeCategory);
            if (!selectedCat || productsByCategory[activeCategory]) return;

            try {
                const res = await api.get(`/products/category/${encodeURIComponent(selectedCat.name)}`);
                setProductsByCategory((prev) => ({
                    ...prev,
                    [activeCategory]: res.data
                }));
            } catch (err) {
                console.error('Failed to fetch category products', err);
            }
        };

        fetchCategoryProducts();
    }, [activeCategory]);

    const renderForYouSections = () => {
        return categories.map((cat) => {
            const products = productsByCategory[cat._id] || [];
            if (products.length === 0) return null;

            return (
                <div key={cat._id} className="mb-4">
                    <h5 className="mb-2">{cat.name}</h5>
                    <div className="d-flex overflow-auto gap-3 pb-2">
                        {products.map((product) => (
                            <SmallProductCard key={product._id} product={product} quantity={1} showQuantity={false} />
                        ))}
                    </div>
                </div>
            );
        });
    };

    const renderSelectedCategory = () => {
        const selected = categories.find((c) => c._id === activeCategory);
        const products = productsByCategory[activeCategory] || [];

        return (
            <>
                <h5 className="mb-3">For you in {selected?.name}</h5>
                {products.length === 0 ? (
                    <p>No products found in this category.</p>
                ) : (
                    <div className="row g-3">
                        {products.map((product) => (
                            <div key={product._id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                <div className="card h-100">
                                    <img
                                        src={product.images?.[0]}
                                        className="card-img-top"
                                        alt={product.name}
                                        style={{ height: '140px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body p-2">
                                        <h6 className="card-title text-truncate">{product.name}</h6>
                                        <p className="mb-0 text-muted small">₹{product.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="container-fluid">
            <div className="row" style={{ height: '100vh', overflow: 'hidden' }}>
                {/* Sidebar */}
                <div
                    className="col-auto"
                    style={{
                        width: '100px',
                        height: '100vh',
                        overflowY: 'auto',
                        backgroundColor: '#f8f9fa',
                        borderRight: '1px solid #dee2e6',
                        padding: '1rem 0.5rem',
                        position: 'sticky',
                        top: 0,
                    }}
                >
                    <div
                        onClick={() => setActiveCategory('foryou')}
                        style={{
                            border: activeCategory === 'foryou' ? '2px solid #007bff' : '1px solid #ccc',
                            borderRadius: '50%',
                            marginBottom: '1rem',
                            padding: '4px',
                        }}
                    >
                        <CategoryCard category={{ name: 'For You', icon: '🧠' }} />
                    </div>

                    {categories.map((cat) => (
                        <div
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            style={{
                                border: activeCategory === cat._id ? '2px solid #007bff' : '1px solid #ccc',
                                borderRadius: '50%',
                                marginBottom: '1rem',
                                padding: '4px',
                            }}
                        >
                            <CategoryCard category={cat} />
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="col p-4 overflow-auto">
                    {activeCategory === 'foryou' ? renderForYouSections() : renderSelectedCategory()}
                </div>
            </div>
        </div>
    );

}
