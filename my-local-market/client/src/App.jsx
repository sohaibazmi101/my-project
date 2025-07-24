import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopList from './pages/ShopList';
import ShopDetails from './pages/ShopDetails';
import ProductView from './pages/ProductView';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

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
    </Routes>
    <Footer />
    </>
  );
}

export default App;
