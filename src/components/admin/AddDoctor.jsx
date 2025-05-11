import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { doctorService, specialtyService } from '../../services/api';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CakeIcon, 
  BriefcaseIcon, 
  LockClosedIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AddDoctor = ({ onClose, onDoctorAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  
  const [formData, setFormData] = useState({
    drName: '',
    mobileNo: '',
    emailId: '',
    gender: 'Male',
    age: '',
    experience: '',
    password: '',
    spId: ''
  });

  // Fetch specialties when component mounts
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await specialtyService.getAllSpecialties();
        setSpecialties(response.data);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        toast.error('Failed to load specialties');
        // Fallback to default specialties if API fails
        setSpecialties([
          { spId: 1, spName: 'Cardiology' },
          { spId: 2, spName: 'Dermatology' },
          { spId: 3, spName: 'Neurology' },
          { spId: 4, spName: 'Orthopedics' },
          { spId: 5, spName: 'Pediatrics' }
        ]);
      } finally {
        setIsLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Form validation
      if (!formData.drName || !formData.mobileNo || !formData.emailId || !formData.age || 
          !formData.experience || !formData.password || !formData.spId) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.mobileNo.length !== 10 || !/^[0-9]+$/.test(formData.mobileNo)) {
        throw new Error('Mobile number should be 10 digits');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
        throw new Error('Please enter a valid email address');
      }

      // Send doctor data as JSON
      const response = await doctorService.addDoctor(formData);
      toast.success('Doctor added successfully!');
      if (onDoctorAdded) {
        onDoctorAdded(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add doctor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Add New Doctor</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor's Name */}
            <div>
              <label htmlFor="drName" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor's Name*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="drName"
                  name="drName"
                  value={formData.drName}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Dr. Full Name"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="mobileNo"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="10-digit mobile number"
                  required
                  maxLength={10}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="emailId" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="emailId"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="doctor@example.com"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender*
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CakeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="25"
                  max="80"
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Age"
                  required
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Experience (years)*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  max="60"
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Years of experience"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Create password for doctor"
                  required
                />
              </div>
            </div>

            {/* Specialty */}
            <div>
              <label htmlFor="spId" className="block text-sm font-medium text-gray-700 mb-1">
                Specialty*
              </label>
              <select
                id="spId"
                name="spId"
                value={formData.spId}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={isLoadingSpecialties}
              >
                <option value="">Select Specialty</option>
                {isLoadingSpecialties ? (
                  <option value="" disabled>Loading specialties...</option>
                ) : (
                  specialties.map(specialty => (
                    <option key={specialty.spId} value={specialty.spId}>
                      {specialty.spName}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor; 