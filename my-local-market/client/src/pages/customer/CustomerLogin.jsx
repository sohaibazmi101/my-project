import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { useCustomer } from '../../contexts/CustomerContext';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { setCustomer } = useCustomer();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture, sub } = decoded;

      // Send token or user info to backend
      const res = await api.post('/customers/google-login', {
        email,
        name,
        picture,
        googleId: sub
      });

      localStorage.setItem('customerToken', res.data.token);
      setCustomer(res.data.customer);
      localStorage.removeItem('token');
      localStorage.removeItem('seller');

      alert('Logged in with Google!');
      navigate('/');
    } catch (err) {
      console.error('Google login failed:', err);
      alert('Google login failed');
    }
  };

  return (
    <div className="container pt-5 mt-5" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4">Customer Login with Google</h3>
      <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Login Failed')} />
    </div>
  );
}
