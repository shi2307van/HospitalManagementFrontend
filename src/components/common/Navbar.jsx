import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  // Minimal state for UI toggle only
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Mock navigation links with no actual functionality
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Doctors", path: "/doctors" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // Simple mock function for UI purposes
  const isActive = (path) => {
    return window.location.pathname === path;
  };

  return (
    <nav>
      {/* Top info bar */}
      <div className="bg-primary-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center text-sm">
          <div className="flex items-center space-x-8">
            <span className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2" /> +1 (555) 123-4567</span>
            <span className="flex items-center"><EnvelopeIcon className="h-4 w-4 mr-2" /> info@healthconnect.com</span>
          </div>
          <div className="flex items-center space-x-8 mt-2 sm:mt-0">
            <span className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2" /> Emergency: +1 (555) 911</span>
            <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-2" /> Mon-Fri 8AM-8PM</span>
          </div>
        </div>
      </div>
      
      {/* Main navbar */}
      <div className={`sticky top-0 left-0 right-0 z-50 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white'
      } transition-all duration-300 ease-in-out`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Health</span>
                  <span className="text-gray-800">Connect</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-base font-medium px-3 py-2 rounded-md transition-colors ${isActive(link.path) 
                    ? 'text-primary-600 bg-primary-50/50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pl-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-primary-500 focus:outline-none"
              >
                {isOpen ? (
                  <XMarkIcon className="h-7 w-7" />
                ) : (
                  <Bars3Icon className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-2 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? "bg-primary-50 text-primary-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/login"
                className="flex items-center justify-center w-full px-6 py-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 