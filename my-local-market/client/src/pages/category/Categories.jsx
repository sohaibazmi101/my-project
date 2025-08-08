import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import SmallProductCard from '../../components/SmallProductCard';
import CategoryCard from '../../components/CategorySides';
import foryouIcon from '../../assets/foryou.png';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();

    const activeCategory = searchParams.get('category') || 'foryou';

    useEffect(() => {
        const fetchCategoriesAndProducts = async () => {
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

        fetchCategoriesAndProducts();
    }, []);

    const handleCategorySelect = (categoryId) => {
        setSearchParams({ category: categoryId });
    };

    const renderForYouSections = () => {
        return categories.map((cat) => {
            const products = productsByCategory[cat._id] || [];
            if (products.length === 0) return null;

            return (
                <div key={cat._id} className="mb-4">
                    <h5 className="mb-2">{cat.name}</h5>
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
                </div>
            );
        });
    };

    const renderSelectedCategory = () => {
        const selectedCategory = categories.find((c) => c._id === activeCategory);
        const products = productsByCategory[activeCategory] || [];

        return (
            <>
                <h5 className="mb-3">Products in {selectedCategory?.name}</h5>
                {products.length === 0 ? (
                    <p>No products found in this category.</p>
                ) : (
                    <div className="d-flex overflow-auto gap-1 pb-2">
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
    height: '100vh',         // Full viewport height
    overflowY: 'auto',       // Sidebar can scroll internally if needed
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #dee2e6',
    padding: '1rem 0.5rem',
    position: 'fixed',       // Fix sidebar position
    top: 0,
    left: 0,
    zIndex: 1000,
  }}
>
  <div
    className="d-flex flex-column align-items-center w-100"
    style={{ gap: '0.25rem' }}
  >
    {/* For You Category */}
    <div
      onClick={() => handleCategorySelect('foryou')}
      style={{
        backgroundColor: activeCategory === 'foryou' ? '#505cddff' : 'transparent',
        transform: activeCategory === 'foryou' ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s ease',
        borderRadius: '12px',
        cursor: 'pointer',
        padding: '1px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <CategoryCard category={{ name: 'For You', icon: foryouIcon }} />
    </div>

    <hr className="w-100 my-1" />

    {/* Other Categories */}
    {categories
      .slice() // copy to avoid mutation
      .sort((a, b) => a.rank - b.rank)
      .map((cat, index) => (
        <div
          key={cat._id}
          className="w-100 d-flex flex-column align-items-center"
        >
          <div
            onClick={() => handleCategorySelect(cat._id)}
            style={{
              backgroundColor: activeCategory === cat._id ? '#505cddff' : 'transparent',
              transform: activeCategory === cat._id ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s ease',
              borderRadius: '12px',
              cursor: 'pointer',
              padding: '1px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CategoryCard category={cat} />
          </div>
          {index < categories.length - 1 && <hr className="w-100 my-1" />}
        </div>
      ))}
  </div>
</div>


                {/* Main Content */}
                <div
                    className="col p-4 overflow-auto"
                    style={{
                        marginLeft: '70px',  // Make space for fixed sidebar width
                        height: '100vh',
                        overflowY: 'auto',
                    }}
                >
                    {activeCategory === 'foryou'
                        ? renderForYouSections()
                        : renderSelectedCategory()}
                </div>
            </div>
        </div>
    );

}
