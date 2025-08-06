// src/components/GoogleLoginModal.jsx
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { useCustomer } from '../contexts/CustomerContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginModal({ show, onClose }) {
  const { setCustomer } = useCustomer();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture, sub } = decoded;

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
      onClose(); // Close modal
    } catch (err) {
      console.error('Google login failed:', err);
      alert('Google login failed');
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content text-center p-4">
          <div className="modal-header">
            <h5 className="modal-title">Login to Continue</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Login Failed')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
