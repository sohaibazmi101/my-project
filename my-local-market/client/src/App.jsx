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
import AdminFeaturedProducts from './pages/admin/FeaturedProducts';
import Banners from './pages/admin/Banners';
import SearchResults from './pages/SearchResults';
import FeaturedProducts from './pages/FeaturedProducts';
import AddProduct from './pages/AddProduct';
import ManageShop from './pages/ManageShop';
import { CustomerProvider, useCustomer } from './contexts/CustomerContext';
import { SellerProvider } from './contexts/SellerContext';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import CustomerProfile from './pages/customer/CustomerProfile';
import CartPage from './pages/customer/CartPage';
import UpdateCustomerProfile from './pages/customer/UpdateCustomerProfile';
import CustomerLogin from './pages/customer/CustomerLogin';
import SellerProtectedRoute from './components/SellerProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Component to handle loading state
function AppContent() {
  const { loading } = useCustomer(); // Must be inside CustomerProvider

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shops" element={<ShopList />} />
        <Route path="/shops/:id" element={<ShopDetails />} />
        <Route path="/product/:id" element={<ProductView />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/featured" element={<FeaturedProducts />} />

        {/* Seller Dashboard Routes (protected) */}
        <Route
          path="/dashboard"
          element={
            <SellerProtectedRoute>
              <Dashboard />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard/add-product"
          element={
            <SellerProtectedRoute>
              <AddProduct />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/sellers/me"
          element={
            <SellerProtectedRoute>
              <ManageShop />
            </SellerProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="categories" element={<Categories />} />
          <Route path="featured" element={<AdminFeaturedProducts />} />
          <Route path="banners" element={<Banners />} />
        </Route>

        {/* Customer Routes (protected) */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route
          path="/customer/profile"
          element={
            <CustomerProtectedRoute>
              <CustomerProfile />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <CustomerProtectedRoute>
              <CartPage />
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/customer/update-profile"
          element={
            <CustomerProtectedRoute>
              <UpdateCustomerProfile />
            </CustomerProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <CustomerProvider>
        <SellerProvider>
          <AppContent />
        </SellerProvider>
      </CustomerProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
