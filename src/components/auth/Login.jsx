import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  LockClosedIcon, 
  UserIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowRightIcon,
  HeartIcon,
  BeakerIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { authService } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Prepare credentials object to match backend LoginRequest
      const credentials = {
        email: formData.email,
        password: formData.password,
        userType: formData.role.toUpperCase()
      };
      
      console.log("Sending login request:", credentials);
      
      // Select the appropriate login endpoint based on role
      let response;
      switch (formData.role) {
        case 'patient':
          response = await authService.patientLogin(credentials);
          break;
        case 'doctor':
          response = await authService.doctorLogin(credentials);
          break;
        case 'admin':
          response = await authService.adminLogin(credentials);
          break;
        default:
          throw new Error('Invalid role selected');
      }
      
      // Extract response data that matches the LoginResponse from backend
      const responseData = response.data;
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Authentication failed');
      }
      
      // Store authentication data in localStorage
      localStorage.setItem('token', responseData.token);
      
      const userData = {
        id: responseData.userId,
        name: responseData.name,
        email: responseData.email,
        role: responseData.userType
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Show success message
      toast.success('Login successful!');
      
      // Direct navigation using window.location for more reliable page refresh
      const role = responseData.userType.toLowerCase();
      if (role === 'patient') {
        window.location.href = '/patient/dashboard';
      } else if (role === 'doctor') {
        window.location.href = '/doctor/dashboard';
      } else if (role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="absolute inset-0 opacity-10 bg-pattern-dots"></div>
          <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-white opacity-10 rounded-full"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white opacity-10 rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 py-20">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl mb-8">
            <svg className="w-10 h-10 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">HealthConnect</h2>
          <p className="text-white/90 text-lg text-center max-w-md mb-12">
            Your comprehensive healthcare platform for managing appointments, medical records, and personalized care.
          </p>
          
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <HeartIcon className="h-10 w-10 text-white mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Patient Care</h3>
              <p className="text-white/80 text-sm">Access your appointments and health records securely</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <BeakerIcon className="h-10 w-10 text-white mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Advanced Tech</h3>
              <p className="text-white/80 text-sm">Cutting-edge healthcare technology at your fingertips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your healthcare dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
              </div>
              <div className="relative rounded-md shadow-sm">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-primary-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* User Role - Dropdown */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                I am a:
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900 appearance-none"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3.5 px-4 overflow-hidden rounded-lg text-white font-medium group"
              >
                <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 group-hover:bg-gradient-to-r group-hover:from-primary-600 group-hover:via-primary-500 group-hover:to-primary-600"></span>
                <span className="absolute inset-0 w-full h-full opacity-0 transition-all duration-300 ease-out bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 group-hover:opacity-100"></span>
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      <span>Sign in</span>
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">Don't have an account?</p>
            <a 
              href="/register" 
              className="inline-block rounded-md border-2 border-primary-500 px-6 py-3 text-sm font-medium text-primary-600 hover:bg-primary-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 