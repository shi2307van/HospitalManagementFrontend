import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ sidebarItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use actual logout functionality
  const handleLogout = () => {
    console.log("Logout clicked - redirecting to force login page");
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate to force login page
    window.location.replace('/forcelogin');
  };

  // Simple and reliable isActive function
  const isActive = (path) => {
    // Simple exact match - this ensures Dashboard only matches Dashboard, not prescriptions
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? '' : 'hidden'
        }`}
      >
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)} 
        />
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl transform transition-transform duration-300">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="ml-2 text-xl font-bold">
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Health</span>
                <span className="text-gray-800">Connect</span>
              </h1>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600"
                      : item.highlight 
                        ? "text-primary-600 bg-primary-50/50 hover:bg-primary-50" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-primary-500"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${
                    isActive(item.href) || item.highlight
                      ? "text-primary-500"
                      : "text-gray-500"
                  }`} />
                  {item.name}
                  {item.highlight && !isActive(item.href) && (
                    <div className="ml-auto">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-500"></div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-colors text-white bg-primary-600 hover:bg-white hover:text-red-600 hover:border hover:border-red-600 shadow-sm group"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-white group-hover:text-red-600" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="ml-2 text-xl font-bold">
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Health</span>
                <span className="text-gray-800">Connect</span>
              </h1>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-primary-50 text-primary-600"
                      : item.highlight 
                        ? "text-primary-600 bg-primary-50/50 hover:bg-primary-50" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-primary-500"
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${
                    isActive(item.href) || item.highlight
                      ? "text-primary-500"
                      : "text-gray-500"
                  }`} />
                  {item.name}
                  {item.highlight && !isActive(item.href) && (
                    <div className="ml-auto">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary-500"></div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-colors text-white bg-primary-600 hover:bg-white hover:text-red-600 hover:border hover:border-red-600 shadow-sm group"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-white group-hover:text-red-600" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 shadow-sm">
          <button
            type="button"
            className="px-4 text-gray-600 hover:text-primary-600 focus:outline-none transition-colors lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold text-gray-800">
                {sidebarItems.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center mr-2">
              <Link to={location.pathname.includes('/patient') ? '/patient/profile' : 
                      (location.pathname.includes('/doctor') ? '/doctor/profile' : '/admin/profile')} 
                   className="relative h-12 w-12 cursor-pointer group" 
                   title="Update Profile">
                {/* Main icon - with hover and active effects */}
                <div className="rounded-full h-12 w-12 bg-primary-500 flex items-center justify-center transition-all duration-300 group-hover:bg-primary-600 group-hover:shadow-md group-active:scale-95">
                  <UserCircleIcon className="h-8 w-8 text-white" />
                </div>
                {/* Tooltip */}
                <div className="absolute -bottom-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Update Profile
                </div>
              </Link>
            </div>
          </div>
        </div>

        <main className="flex-1 pb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 