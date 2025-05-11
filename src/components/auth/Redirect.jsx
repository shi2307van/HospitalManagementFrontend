import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component that handles redirection based on query parameters
 */
const Redirect = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    try {
      // Get the redirect parameters from URL
      const params = new URLSearchParams(window.location.search);
      const role = params.get('role');
      const token = params.get('token');
      const userId = params.get('userId');
      const name = params.get('name');
      const email = params.get('email');
      
      console.log("Redirect component loaded with params:", { role, token, userId, name, email });
      
      if (!token) {
        throw new Error("Missing token parameter in redirect URL");
      }
      
      if (!role) {
        throw new Error("Missing role parameter in redirect URL");
      }
      
      // Store the token and user data in localStorage
      localStorage.setItem('token', token);
      
      const userData = {
        id: userId || '',
        name: name || '',
        email: email || '',
        role: role
      };
      
      console.log("Storing user data in localStorage:", userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Determine where to redirect based on role
      const roleLC = role.toLowerCase();
      console.log("Role for redirection:", roleLC);
      
      // Short delay to ensure localStorage is updated
      setTimeout(() => {
        try {
          if (roleLC === 'patient') {
            console.log("Redirecting to patient dashboard...");
            window.location.href = '/patient/dashboard';
          } else if (roleLC === 'doctor') {
            console.log("Redirecting to doctor dashboard...");
            window.location.href = '/doctor/dashboard';
          } else if (roleLC === 'admin') {
            console.log("Redirecting to admin dashboard...");
            window.location.href = '/admin/dashboard';
          } else {
            console.log("Unknown role, redirecting to home...");
            window.location.href = '/';
          }
        } catch (redirectError) {
          console.error("Error during final redirect:", redirectError);
          setError(`Redirect error: ${redirectError.message}`);
        }
      }, 500);
    } catch (err) {
      console.error("Error in redirect component:", err);
      setError(err.message);
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {error ? (
          <>
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Redirect Error</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Redirecting...</h2>
            <p className="text-gray-500">Please wait while we direct you to your dashboard.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Redirect; 