import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EmergencyAccess = () => {
  const [mockUser, setMockUser] = useState({
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'PATIENT'
  });
  
  const [status, setStatus] = useState('');

  const handleRoleChange = (e) => {
    setMockUser({
      ...mockUser,
      role: e.target.value
    });
  };

  const handleDirectAccess = () => {
    try {
      // Set mock data to localStorage
      localStorage.setItem('token', 'emergency-access-token-123');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setStatus('Auth data set! Click one of the direct access links below.');
    } catch (e) {
      setStatus('Error: ' + e.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Emergency Dashboard Access</h1>
      <p className="text-gray-700 mb-4">
        This page allows you to bypass the normal login flow for testing purposes.
        Use it to directly access dashboards when troubleshooting authentication issues.
      </p>
      
      <div className="bg-yellow-50 p-4 mb-6 rounded-md border border-yellow-200">
        <h2 className="font-semibold text-yellow-800 mb-2">Warning</h2>
        <p className="text-yellow-700 text-sm">
          This is for development and testing only. Using this in production would be a security risk.
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Mock User Role:</label>
        <select 
          value={mockUser.role}
          onChange={handleRoleChange}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      
      <button 
        onClick={handleDirectAccess}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mb-4"
      >
        Set Mock Auth Data
      </button>
      
      {status && (
        <div className="mb-6 p-3 bg-green-50 text-green-800 rounded border border-green-200">
          {status}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Link 
          to="/patient/dashboard" 
          className="bg-green-600 text-white text-center p-3 rounded hover:bg-green-700"
        >
          Patient Dashboard
        </Link>
        <Link 
          to="/doctor/dashboard" 
          className="bg-blue-600 text-white text-center p-3 rounded hover:bg-blue-700"
        >
          Doctor Dashboard
        </Link>
        <Link 
          to="/admin/dashboard" 
          className="bg-purple-600 text-white text-center p-3 rounded hover:bg-purple-700"
        >
          Admin Dashboard
        </Link>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold text-gray-700 mb-2">Debugging Info:</h3>
        <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
          {JSON.stringify({
            mockUser,
            localStorage: {
              token: localStorage.getItem('token') ? '✓ Present' : '✗ Missing',
              user: localStorage.getItem('user') ? '✓ Present' : '✗ Missing'
            }
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EmergencyAccess; 