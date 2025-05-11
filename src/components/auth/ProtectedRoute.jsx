import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

// ProtectedRoute component verifies authentication and role before rendering children
const ProtectedRoute = ({ requiredRole }) => {
  const [authState, setAuthState] = useState({
    isChecking: true,
    isAuthenticated: false,
    userRole: null
  });
  
  // Check authentication on mount with direct localStorage access
  useEffect(() => {
    try {
      // Get data directly from localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log("ProtectedRoute - localStorage check:", { 
        hasToken: !!token, 
        hasUserData: !!userStr 
      });
      
      let authenticated = false;
      let userRole = null;
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          userRole = userData.role;
          authenticated = true;
          console.log("ProtectedRoute - Authenticated as:", userRole);
        } catch (e) {
          console.error("ProtectedRoute - Error parsing user data:", e);
        }
      } else {
        console.log("ProtectedRoute - Not authenticated (missing token or user data)");
      }
      
      setAuthState({
        isChecking: false,
        isAuthenticated: authenticated,
        userRole: userRole
      });
    } catch (error) {
      console.error("ProtectedRoute - Error checking auth:", error);
      setAuthState({
        isChecking: false,
        isAuthenticated: false,
        userRole: null
      });
    }
  }, []);
  
  // Show loading while checking
  if (authState.isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-2">Verifying your access...</p>
      </div>
    );
  }
  
  console.log("=== PROTECTED ROUTE CHECK ===");
  console.log("Is authenticated:", authState.isAuthenticated);
  console.log("User role:", authState.userRole);
  console.log("Required role:", requiredRole);
  console.log("============================");

  // Check if authenticated
  if (!authState.isAuthenticated) {
    console.log("⛔ Not authenticated - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user role exists
  if (!authState.userRole) {
    console.log("⛔ No user role found - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Compare roles (if required role is specified)
  if (requiredRole) {
    // Make uppercase for consistent comparison
    const userRoleUpper = authState.userRole.toUpperCase();
    const requiredRoleUpper = requiredRole.toUpperCase();
    
    console.log(`Comparing roles: User ${userRoleUpper} vs Required ${requiredRoleUpper}`);
    
    // Remove bypass - enforce proper role checking
    // const bypassRoleCheck = true; // Set to true to bypass role check
    // if (bypassRoleCheck) {
    //   console.log("⚠️ BYPASSING ROLE CHECK - ALWAYS GRANTING ACCESS ⚠️");
    //   return <Outlet />;
    // }
    
    // If roles match, allow access
    if (userRoleUpper === requiredRoleUpper) {
      console.log("✅ Roles match - granting access");
      return <Outlet />;
    }
    
    // If roles don't match, redirect to appropriate dashboard
    console.log("⛔ Roles don't match - redirecting to appropriate dashboard");
    
    if (userRoleUpper === 'PATIENT') {
      console.log("→ Redirecting to patient dashboard");
      return <Navigate to="/patient/dashboard" replace />;
    } else if (userRoleUpper === 'DOCTOR') {
      console.log("→ Redirecting to doctor dashboard");
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (userRoleUpper === 'ADMIN') {
      console.log("→ Redirecting to admin dashboard");
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      console.log("→ Unknown role - redirecting to login");
      return <Navigate to="/login" replace />;
    }
  }

  // If we got here, user is authenticated and no specific role is required
  console.log("✅ Authentication passed, no specific role required");
  return <Outlet />;
};

export default ProtectedRoute; 