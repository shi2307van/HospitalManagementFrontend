import { useEffect } from 'react';

/**
 * ForceLogin - Simple component that forces immediate redirection to login page
 */
const ForceLogin = () => {
  useEffect(() => {
    console.log("ForceLogin - Immediately redirecting to login");
    
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Force redirect
    window.location.replace('/login');
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Redirecting to Login</h1>
        <p className="text-gray-600 mb-4">Please wait...</p>
        <a 
          href="/login"
          className="inline-block px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
        >
          Go to Login Now
        </a>
      </div>
    </div>
  );
};

export default ForceLogin; 