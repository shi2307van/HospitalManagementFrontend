import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { toast } from 'react-toastify';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log("LOGOUT COMPONENT - Starting logout process");
        
        // Clear local storage immediately
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show success message
        toast.success('You have been logged out successfully.');
        
        console.log("LOGOUT COMPONENT - Redirecting to login page");
        
        // Force hard redirect to login page
        window.location.replace('/login');
      } catch (error) {
        console.error('Error during logout:', error);
        // In case of error, still redirect
        window.location.replace('/login');
      }
    };

    // Small timeout to ensure component is mounted
    setTimeout(() => {
      performLogout();
    }, 300);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Logging out...</h2>
        <p className="mt-2 text-gray-600">Please wait while we log you out.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        </div>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="mt-6 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
        >
          Go to Login Now
        </button>
      </div>
    </div>
  );
};

export default Logout; 