import React, { useEffect } from 'react';

/**
 * DirectAccess component - Provides immediate access to patient dashboard
 * This component sets auth data and redirects directly to patient dashboard
 */
const DirectAccess = () => {
  useEffect(() => {
    // First, log current state
    console.log("⚡ DirectAccess - Setting auth data...");
    
    // Set dummy patient data
    const patientData = {
      id: '123',
      name: 'Direct Access User',
      email: 'patient@example.com',
      role: 'PATIENT'
    };
    
    // Always set fresh data to localStorage
    localStorage.setItem('token', 'direct-access-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify(patientData));
    
    console.log("⚡ DirectAccess - Auth data set, redirecting...");
    
    // Force a hard redirect to patient dashboard
    window.location.replace('/dashboard');
  }, []);
  
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Direct Access Mode</h1>
        <p className="text-gray-600">Setting up authentication and redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default DirectAccess; 