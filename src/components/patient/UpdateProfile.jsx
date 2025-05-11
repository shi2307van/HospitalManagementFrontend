import { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { patientService } from '../../services/api';
import { toast } from 'react-toastify';

// API base URL - must match the one in api.js
const API_BASE_URL = 'http://localhost:8080';

const UpdateProfile = () => {
  // Initial empty profile - will be populated from localStorage
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    bloodGroup: '',
    age: ''
  });

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailPrescriptions: true,
    emailResults: true,
    smsAppointments: true,
    smsReminders: false
  });

  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        console.log('Fetched user data:', userData);
        
        // Extract user ID for API calls
        if (userData.id) {
          setUserId(userData.id);
        }
        
        // Split name into first and last name if available
        if (userData.name) {
          const nameParts = userData.name.split(' ');
          setProfile(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || ''
          }));
        }
        
        // Set email if available
        if (userData.email) {
          setProfile(prev => ({
            ...prev,
            email: userData.email || ''
          }));
        }
        
        // After initial localStorage data is set, fetch additional data from backend if we have ID
        if (userData.id) {
          fetchPatientData(userData.id);
        } else {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
        setError("No user data found. Please log in again.");
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
      setLoadingProfile(false);
      setError("Error loading user data.");
    }
  }, []);

  // Fetch additional patient data from backend
  const fetchPatientData = async (id) => {
    setLoadingProfile(true);
    try {
      const response = await patientService.getPatientById(id);
      if (response && response.data) {
        const patientData = response.data;
        
        // Set profile data
        setProfile(prev => ({
          ...prev,
          phone: patientData.mobileNo || patientData.Mobile_No || patientData.contact || prev.phone,
          dateOfBirth: patientData.dob || patientData.DOB || prev.dateOfBirth,
          gender: patientData.gender?.toLowerCase() || prev.gender,
          address: patientData.address || patientData.Address || prev.address,
          bloodGroup: patientData.bloodGroup || patientData.Blood_Group || prev.bloodGroup,
          // Set age directly from backend or default to empty string
          age: patientData.age || patientData.Age || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      
      // Use mock data if API fails
      if (error.message === 'Network Error') {
        setIsDemoMode(true);
        useMockData(id);
        toast.info('Using demo mode - changes will not be saved to server');
      } else {
        toast.error('Failed to load your profile data. Please try again later.');
        setError("Failed to load profile data from server.");
      }
    } finally {
      setLoadingProfile(false);
    }
  };
  


  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle notification preferences changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Cannot update profile: User ID not found');
      return;
    }
    // Validate name
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    if (!fullName) {
      toast.error('Name cannot be empty. Please enter your first and last name.');
      return;
    }
    setLoading(true);
    try {
      if (isDemoMode) {
        setTimeout(() => {
          toast.success('Profile updated successfully! (Demo Mode)');
          setSuccessMessage('Profile updated successfully! (Demo Mode)');
          setLoading(false);
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        }, 1500);
        return;
      }

      // Use camelCase keys for backend compatibility
      const patientData = {
        id: userId, // assuming backend expects 'id'
        name: fullName, // assuming backend expects 'name'
        email: profile.email,
        mobileNo: profile.phone, // assuming backend expects 'mobileNo'
        dob: profile.dateOfBirth, // assuming backend expects 'dob'
        gender: profile.gender,
        address: profile.address,
        bloodGroup: profile.bloodGroup,
        age: profile.age
      };

      console.log('Updating patient with data:', patientData);

      // Update patient data in the backend
      const response = await patientService.updatePatient(userId, patientData);
      console.log('Update response:', response);

      if (response && response.data) {
        toast.success('Profile updated successfully!');
        setSuccessMessage('Profile updated successfully!');
        // Optionally update localStorage user data
        const updatedUser = { ...JSON.parse(localStorage.getItem('user')), name: fullName, email: profile.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        toast.error('Profile update failed: No response data.');
      }

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error, error?.response);
      if (error?.response?.data?.message) {
        toast.error('Failed to update profile: ' + error.response.data.message);
      } else {
        toast.error('Failed to update profile. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render the component UI
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-green-800">Personal Information</h1>
          <p className="text-gray-600 mt-1">Update your profile information and preferences</p>
      </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
        </div>
      )}

        {/* Loading state */}
        {loadingProfile && (
          <div className="flex justify-center py-6">
            <div className="animate-pulse flex space-x-4 items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Loading your profile...</span>
            </div>
          </div>
        )}
        
        {/* Form fields */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
          {/* First Name */}
          <div className="relative">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
              name="firstName"
                id="firstName"
                value={profile.firstName}
                onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors"
                required
              placeholder="Enter your first name"
              />
            </div>
          
          {/* Last Name */}
          <div className="relative">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
              name="lastName"
                id="lastName"
                value={profile.lastName}
                onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors"
                required
              placeholder="Enter your last name"
              />
            </div>
          
          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
              name="email"
                id="email"
                value={profile.email}
                onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors"
                required
              placeholder="Enter your email address"
              />
            </div>
          
          {/* Phone */}
          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
              name="phone"
                id="phone"
                value={profile.phone}
                onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors"
                required
              placeholder="Enter your phone number"
              />
            </div>
          
          {/* Date of Birth */}
          <div className="relative">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
              name="dateOfBirth"
                id="dateOfBirth"
                value={profile.dateOfBirth}
                onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors"
              />
            </div>
          
          {/* Age */}
          <div className="relative">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
              name="age"
                id="age"
                value={profile.age}
                onChange={handleChange}
                min="0"
                max="120"
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors"
              placeholder="Your age"
              />
            </div>
          
          {/* Gender */}
          <div className="relative">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
              name="gender"
                id="gender"
                value={profile.gender}
                onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors appearance-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{top: '30px'}}>
              <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Blood Group */}
          <div className="relative">
            <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
              name="bloodGroup"
                id="bloodGroup"
                value={profile.bloodGroup}
                onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors appearance-none"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{top: '30px'}}>
              <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Address - Full width */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
              name="address"
                id="address"
                value={profile.address}
                onChange={handleChange}
                rows={3}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors"
              placeholder="Enter your full address"
              ></textarea>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Notification Preferences</h2>
          <div className="space-y-5">
            <div className="flex items-start hover:bg-green-50 p-3 rounded-lg transition-colors">
              <div className="flex items-center h-5">
                  <input
                    id="emailAppointments"
                    name="emailAppointments"
                    type="checkbox"
                    checked={notifications.emailAppointments}
                    onChange={handleNotificationChange}
                  className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailAppointments" className="font-medium text-gray-700">Email appointment reminders</label>
                <p className="text-gray-500 mt-1">Receive emails about upcoming appointments</p>
              </div>
                </div>
            
            <div className="flex items-start hover:bg-green-50 p-3 rounded-lg transition-colors">
              <div className="flex items-center h-5">
                  <input
                    id="emailPrescriptions"
                    name="emailPrescriptions"
                    type="checkbox"
                    checked={notifications.emailPrescriptions}
                    onChange={handleNotificationChange}
                  className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailPrescriptions" className="font-medium text-gray-700">Email prescription updates</label>
                <p className="text-gray-500 mt-1">Receive emails when prescriptions are updated</p>
              </div>
            </div>
            
            <div className="flex items-start hover:bg-green-50 p-3 rounded-lg transition-colors">
              <div className="flex items-center h-5">
                  <input
                    id="smsAppointments"
                    name="smsAppointments"
                    type="checkbox"
                    checked={notifications.smsAppointments}
                    onChange={handleNotificationChange}
                  className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                </div>
              <div className="ml-3 text-sm">
                <label htmlFor="smsAppointments" className="font-medium text-gray-700">SMS appointment reminders</label>
                <p className="text-gray-500 mt-1">Receive text messages about upcoming appointments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className={`inline-flex items-center justify-center py-2.5 px-6 text-white text-sm font-medium rounded-lg shadow-md transition-all duration-200 ${
              loading || loadingProfile ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300'
            }`}
            disabled={loading || loadingProfile}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile; 