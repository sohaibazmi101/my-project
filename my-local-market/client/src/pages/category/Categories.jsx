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
                <h5 className="mb-3">Products in {selected?.name}</h5>
                {products.length === 0 ? (
                    <p>No products found in this category.</p>
                ) : (
                    <div className="d-flex overflow-auto gap-3 pb-2">
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
                        width: '70px',
                        height: '100vh',
                        overflowY: 'auto', // Make sidebar scrollable
                        backgroundColor: '#f8f9fa',
                        borderRight: '1px solid #dee2e6',
                        padding: '1rem 0.5rem',
                        position: 'sticky',
                        top: 0,
                    }}
                >
                    <div
                        className="d-flex flex-column align-items-center w-100"
                        style={{ gap: '0.5rem' }}
                    >
                        {/* For You Category */}
                        <div
                            onClick={() => setActiveCategory('foryou')}
                            style={{
                                backgroundColor: activeCategory === 'foryou' ? '#e0e0e0' : 'transparent',
                                transform: activeCategory === 'foryou' ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.2s ease',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <CategoryCard category={{ name: 'For You', icon: 'None' }} />
                        </div>

                        <hr className="w-100 my-2" />

                        {/* Other Categories */}
                        {categories.map((cat, index) => (
                            <div key={cat._id} className="w-100 d-flex flex-column align-items-center">
                                <div
                                    onClick={() => setActiveCategory(cat._id)}
                                    style={{
                                        backgroundColor: activeCategory === cat._id ? '#e0e0e0' : 'transparent',
                                        transform: activeCategory === cat._id ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CategoryCard category={cat} />
                                </div>
                                {index < categories.length - 1 && <hr className="w-100 my-2" />}
                            </div>
                        ))}
                    </div>
                </div>
                {/* Main Content */}
                <div className="col p-4 overflow-auto">
                    {activeCategory === 'foryou' ? renderForYouSections() : renderSelectedCategory()}
                </div>
            </div>
        </div>
    );
}
