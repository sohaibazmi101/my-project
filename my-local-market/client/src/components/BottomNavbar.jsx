import { Link, useLocation } from 'react-router-dom';
import { BiHome, BiCategoryAlt, BiUser, BiCart, BiPlayCircle } from 'react-icons/bi';

export default function BottomNavbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  return (
    <nav className="d-lg-none fixed-bottom bg-light border-top shadow-sm">
      <div className="d-flex justify-content-around py-2">
        <Link to="/" className={`text-center ${isActive('/') ? 'text-primary' : 'text-dark'}`}>
          <BiHome size={24} />
          <div style={{ fontSize: '0.7rem' }}>Home</div>
        </Link>
        <Link to="/play" className={`text-center ${isActive('/play') ? 'text-primary' : 'text-dark'}`}>
          <BiPlayCircle size={24} />
          <div style={{ fontSize: '0.7rem' }}>Play</div>
        </Link>
        <Link to="category/categories" className={`text-center ${isActive('/categories') ? 'text-primary' : 'text-dark'}`}>
          <BiCategoryAlt size={24} />
          <div style={{ fontSize: '0.7rem' }}>Categories</div>
        </Link>
        <Link to="/customer/account" className={`text-center ${isActive('/customer/account') ? 'text-primary' : 'text-dark'}`}>
          <BiUser size={24} />
          <div style={{ fontSize: '0.7rem' }}>Account</div>
        </Link>
        <Link to="/cart" className={`text-center ${isActive('/cart') ? 'text-primary' : 'text-dark'}`}>
          <BiCart size={24} />
          <div style={{ fontSize: '0.7rem' }}>Cart</div>
        </Link>
      </div>
    </nav>
  );
}
