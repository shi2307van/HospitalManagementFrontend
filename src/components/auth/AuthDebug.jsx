import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AuthDebug = () => {
  const [authData, setAuthData] = useState({
    token: null,
    user: null,
    error: null,
    url: window.location.href,
    urlParams: {}
  });

  useEffect(() => {
    try {
      // Get authentication info from localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let user = null;

      // Parse URL parameters
      const urlParams = {};
      const search = window.location.search;
      if (search) {
        const params = new URLSearchParams(search);
        params.forEach((value, key) => {
          urlParams[key] = value;
        });
      }

      // Try to parse user data
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      setAuthData({
        token,
        user,
        error: null,
        url: window.location.href,
        urlParams
      });
    } catch (error) {
      setAuthData({
        token: null,
        user: null,
        error: error.message,
        url: window.location.href,
        urlParams: {}
      });
    }
  }, []);

  // Format JSON for display
  const formatJson = (data) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Auth Debug Panel</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
        <p className="mb-2">
          <span className="font-medium">Status: </span>
          <span className={`font-bold ${authData.token ? 'text-green-600' : 'text-red-600'}`}>
            {authData.token ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current URL</h3>
        <div className="bg-gray-100 p-3 rounded overflow-x-auto">
          <pre className="text-xs">{authData.url}</pre>
        </div>
      </div>

      {Object.keys(authData.urlParams).length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">URL Parameters</h3>
          <div className="bg-gray-100 p-3 rounded overflow-x-auto">
            <pre className="text-xs">{formatJson(authData.urlParams)}</pre>
          </div>
        </div>
      )}

      {authData.error && (
        <div className="mb-4 bg-red-100 p-3 rounded">
          <h3 className="text-red-700 font-semibold">Error</h3>
          <p className="text-red-700">{authData.error}</p>
        </div>
      )}

      {authData.token && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Token</h3>
          <div className="bg-gray-100 p-3 rounded overflow-x-auto">
            <pre className="text-xs">{authData.token}</pre>
          </div>
        </div>
      )}

      {authData.user && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">User Data</h3>
          <div className="bg-gray-100 p-3 rounded overflow-x-auto">
            <pre className="text-xs">{formatJson(authData.user)}</pre>
          </div>
          <p className="mt-2">
            <span className="font-medium">Role: </span>
            <span className="font-bold">{authData.user.role || 'No role found'}</span>
          </p>
        </div>
      )}

      <div className="mt-6 space-y-2">
        <h3 className="text-lg font-semibold mb-2">Actions</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Link 
            to="/login" 
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
          >
            Go to Login
          </Link>
          
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
            className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Auth Data
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Link 
            to="/patient/dashboard" 
            className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center text-sm"
          >
            Patient Dashboard
          </Link>
          
          <Link 
            to="/doctor/dashboard" 
            className="py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 text-center text-sm"
          >
            Doctor Dashboard
          </Link>
          
          <Link 
            to="/admin/dashboard" 
            className="py-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-center text-sm"
          >
            Admin Dashboard
          </Link>
        </div>

        <div className="mt-4">
          <Link
            to="/direct-dashboard"
            className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-center w-full block"
          >
            Direct Patient Dashboard (Bypass Auth)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug; 