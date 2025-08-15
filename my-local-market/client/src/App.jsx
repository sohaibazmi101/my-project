import { Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import Home from './pages/Home';
import Login from './pages/seller/Login';
import Register from './pages/seller/Register';
import ShopList from './pages/ShopList';
import ShopDetails from './pages/ShopDetails';
import ProductView from './pages/ProductView';
import Dashboard from './pages/seller/Dashboard';
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
import AddProduct from './pages/seller/AddProduct';
import ManageShop from './pages/seller/ManageShop';
import { CustomerProvider, useCustomer } from './contexts/CustomerContext';
import { SellerProvider } from './contexts/SellerContext';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import CustomerProfile from './pages/customer/CustomerProfile';
import CartPage from './pages/customer/CartPage';
import UpdateCustomerProfile from './pages/customer/UpdateCustomerProfile';
import CustomerLogin from './pages/customer/CustomerLogin';
import SellerProtectedRoute from './components/SellerProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';
import OrderHistory from './pages/customer/OrderHistory';
import BottomNavbar from './components/BottomNavbar';
import { useLocation } from 'react-router-dom';
import Account from './pages/customer/Account';
import PublicCategories from './pages/category/Categories';
import EditProduct from './pages/seller/EditProduct';
import CategoryView from './pages/category/CategoryView';
import ManageOffers from './pages/admin/ManageOffers';
import ManageTopSellers from './pages/admin/ManageTopSellers';
import TermsAndConditions from './pages/users/TermsAndConditions';
import PrivacyPolicy from './pages/users/PrivacyPolicy';
import HelpAndSupport from './pages/users/HelpAndSupport';
import AboutUs from './pages/users/AboutUs';
import CancellationAndRefund from './pages/users/CancellationAndRefund';
import ShippingAndDelivery from './pages/users/ShippingAndDelivery';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import AdminKycDashboard from './pages/admin/AdminKycDashboard';
import DeliveryBoyLogin from './pages/deliveryboy/DeliveryBoyLogin';
import DeliveryBoyRegister from './pages/deliveryboy/DeliveryBoyRegister';
import DeliveryBoyDashboard from './pages/deliveryboy/DeliveryBoyDashboard';
import ManageDeliveryBoys from './pages/seller/components/ManageDeliveryBoys';


function AppContent() {
  const location = useLocation();
  const { loading } = useCustomer();
  const showTopNavbar = location.pathname === '/';

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <>
    {showTopNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="seller/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shops" element={<ShopList />} />
        <Route path="/shops/:id" element={<ShopDetails />} />
        <Route path="/product/:id" element={<ProductView />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/featured" element={<FeaturedProducts />} />
        <Route path="/category/categories" element={<PublicCategories />} />
        <Route path="/category/:categoryId" element={<CategoryView />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/help" element={<HelpAndSupport />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/refund" element={<CancellationAndRefund />} />
        <Route path="/shipping" element={<ShippingAndDelivery />} />
        <Route path="/deliveylogin" element={<DeliveryBoyLogin />} />
        <Route path="/deliveyboy/login" element={<DeliveryBoyLogin />} />
        <Route path="/deliveryboy/dashboard" element={<DeliveryBoyDashboard />} />
        <Route path="/deliveryregister" element={<DeliveryBoyRegister />} />

        {/* Seller Dashboard Routes (protected) */}
        <Route
          path="seller/dashboard"
          element={
            <SellerProtectedRoute>
              <Dashboard />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="seller/dashboard/add-product"
          element={
            <SellerProtectedRoute>
              <AddProduct />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="seller/products/edit/:id"
          element={
            <SellerProtectedRoute>
              <EditProduct />
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
        <Route
          path="/sellers/orders"
          element={
            <SellerProtectedRoute>
              <SellerOrdersPage />
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/sellers/manage-db"
          element={
            <SellerProtectedRoute>
              <ManageDeliveryBoys />
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
          <Route path="/admin/manage-offers" element={<ManageOffers />} />
          <Route path="/admin/manage-top-seller" element={<ManageTopSellers />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/kyc" element={<AdminKycDashboard />} />
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
          path="/customer/account"
          element={
              <Account />
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
        <Route path="/customer">
          <Route path="orders" element={<OrderHistory />} />
        </Route>

      </Routes>
      <BottomNavbar />
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