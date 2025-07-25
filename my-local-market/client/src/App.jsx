import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopList from './pages/ShopList';
import ShopDetails from './pages/ShopDetails';
import ProductView from './pages/ProductView';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardLayout from './pages/admin/DashboardLayout';
import DashboardHome from './pages/admin/DashboardHome';
import Categories from './pages/admin/Categories';
import FeaturedProducts from './pages/admin/FeaturedProducts';
import Banners from './pages/admin/Banners';
import SearchResults from './pages/SearchResults';




function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shops" element={<ShopList />} />
        <Route path="/shops/:id" element={<ShopDetails />} />
        <Route path="/product/:id" element={<ProductView />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/search" element={<SearchResults />} />

        {/* Admin Dashboard nested routes */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="categories" element={<Categories />} />
          <Route path="featured" element={<FeaturedProducts />} />
          <Route path="banners" element={<Banners />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
