import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { patientService } from '../../services/api';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [userId, setUserId] = useState(null);

  // Check for user ID on component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.id) {
          setUserId(userData.id);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate password strength if the new password field is changed
    if (name === 'newPassword') {
      calculatePasswordStrength(value);
    }
  };
  
  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Complexity checks
    if (/[a-z]/.test(password)) strength += 1; // Lowercase
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase
    if (/[0-9]/.test(password)) strength += 1; // Number
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // Special character
    
    setPasswordStrength(Math.min(5, strength));
  };
  
  // Get password strength color and label
  const getPasswordStrengthInfo = () => {
    switch (passwordStrength) {
      case 0:
        return { color: 'bg-gray-200', label: 'Empty' };
      case 1:
        return { color: 'bg-red-500', label: 'Very Weak' };
      case 2:
        return { color: 'bg-orange-500', label: 'Weak' };
      case 3:
        return { color: 'bg-yellow-500', label: 'Moderate' };
      case 4:
        return { color: 'bg-lime-500', label: 'Strong' };
      case 5:
        return { color: 'bg-green-500', label: 'Very Strong' };
      default:
        return { color: 'bg-gray-200', label: 'Empty' };
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!passwordData.currentPassword || passwordData.currentPassword.trim() === '') {
      toast.error('Please enter your current password');
      return;
    }
    
    if (!passwordData.newPassword || passwordData.newPassword.trim() === '') {
      toast.error('Please enter a new password');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    // Check if we have a user ID
    if (!userId) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUserId(userData.id);
          
          if (!userData.id) {
            toast.error('User ID not found. Please log in again.');
            return;
          }
        } else {
          toast.error('User data not found. Please log in again.');
          return;
        }
      } catch (error) {
        console.error('Error accessing user data:', error);
        toast.error('Error accessing user data. Please log in again.');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Handle demo mode
      if (isDemoMode) {
        setTimeout(() => {
          toast.success('Password updated successfully! (Demo Mode)');
          setSuccessMessage('Password updated successfully! (Demo Mode)');
          
          // Clear form
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          
          setPasswordStrength(0);
          
          // Clear success message after delay
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
          
          setLoading(false);
        }, 1500);
        return;
      }
      
      // Create password data object
      const passwordUpdateData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };
      
      console.log('Updating password for user ID:', userId);
      
      // Use the dedicated changePassword endpoint
      const response = await patientService.changePassword(userId, passwordUpdateData);
      
      console.log('Password update response:', response);
      
      // Check if the response indicates success
      if (response.data && response.data.success) {
        // Show success message
        toast.success(response.data.message || 'Password updated successfully!');
        setSuccessMessage(response.data.message || 'Password updated successfully!');
        
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setPasswordStrength(0);
        
        // Clear success message after delay
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        // Handle unexpected success response format
        toast.warning('Password updated but received an unexpected response');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Check for specific error responses
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        // Handle validation errors (400 Bad Request)
        if (error.response.status === 400) {
          const errorMessage = error.response.data.message || 'Invalid password data';
          toast.error(errorMessage);
        } 
        // Handle unauthorized (current password wrong)
        else if (error.response.status === 401) {
          toast.error('Current password is incorrect');
        }
        // Handle other errors
        else {
          const errorMessage = error.response.data.message || 
                             error.response.data.error || 
                             'Server error occurred. Please try again.';
          toast.error(errorMessage);
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        toast.error('No response received from server. Please check your connection.');
        
        // Switch to demo mode on network error
        setIsDemoMode(true);
        toast.info('Running in demo mode - changes will not be saved to server');
      } else {
        console.error('Error message:', error.message);
        toast.error('Error updating password: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const strengthInfo = getPasswordStrengthInfo();

  return (
    <div className="space-y-8 p-6">
      {/* Page header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h1>
        <p className="text-gray-600">Update your password to keep your account secure</p>
      </div>

      {isDemoMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
          <div className="flex">
            <ExclamationCircleIcon className="h-6 w-6 mr-2" />
            <div>
              <p className="font-bold">Demo Mode Active</p>
              <p className="text-sm">Backend connection unavailable. Password changes will not be saved to the server.</p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Password form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Security</h2>
          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••"
                  required
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your current password first.
              </p>
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••"
                  required
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Password strength meter */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password Strength:</span>
                  <span className="text-xs font-medium" style={{ color: strengthInfo.color === 'bg-gray-200' ? '#718096' : strengthInfo.color.replace('bg-', '').replace('-500', '') }}>
                    {strengthInfo.label}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${strengthInfo.color}`} 
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  For a strong password, use at least 8 characters with a mix of letters, numbers, and symbols.
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    passwordData.newPassword && passwordData.confirmPassword && 
                    passwordData.newPassword !== passwordData.confirmPassword
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="••••••"
                  required
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordData.newPassword && passwordData.confirmPassword && 
               passwordData.newPassword !== passwordData.confirmPassword ? (
                <p className="text-xs text-red-600 mt-1">
                  Passwords do not match.
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Re-enter your new password to confirm.
                </p>
              )}
            </div>
            
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading || (passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword)}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Password...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Password Security Tips</h3>
              <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                <li>Use a mix of letters, numbers, and symbols</li>
                <li>Avoid using personal information</li>
                <li>Don't reuse passwords across multiple sites</li>
                <li>Consider using a password manager</li>
                <li>Change your password regularly</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword; 