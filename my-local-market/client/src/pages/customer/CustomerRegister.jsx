import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import api from '../../services/api';

export default function CustomerRegister() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) {
      alert('Google login failed. No credential received.');
      return;
    }

    try {
      // Optional: decode token to get email/name before sending
      const decoded = jwtDecode(credential);
      console.log('Decoded Google user:', decoded);

      const res = await api.post('/customers/google-login', { token: credential });

      // Set customer token
      localStorage.setItem('customerToken', res.data.token);

      // Clear seller token if present
      localStorage.removeItem('sellerToken');

      alert('Logged in successfully!');
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err);
      alert(err.response?.data?.error || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    alert('Google login failed. Please try again.');
  };

  return (
    <div className="container mt-5 text-center" style={{ maxWidth: '500px' }}>
      <h3 className="mb-4">Continue with Google</h3>
      <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
    </div>
  );
}
