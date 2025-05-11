import { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { doctorService } from '../../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState({
    id: 1,
    name: "",
    specialty: "",
    email: "",
    phone: "",
    license: "",
    age: "",
    gender: "",
    address: "",
    education: [],
    experience: "",
    languages: [],
    profileImage: "",
    certifications: [],
    hospitalAffiliations: [],
    spId: "",
    status: "Active",
    consultationFee: "",
    availableDays: "",
    availableHours: "",
    password: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [specialtyName, setSpecialtyName] = useState("");
  
  // Fetch all specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await doctorService.getAllSpecializations();
        if (response && response.data) {
          console.log('Specializations:', response.data);
          setSpecializations(response.data);
        }
      } catch (err) {
        console.error('Error fetching specializations:', err);
      }
    };
    
    fetchSpecializations();
  }, []);
  
  // Get specialty name based on spId
  const getSpecialtyName = (spId) => {
    if (!spId || !specializations.length) return '';
    
    const specialty = specializations.find(sp => 
      sp.spId === spId || sp.id === spId || sp.spNo === spId
    );
    
    return specialty ? 
      (specialty.spName || specialty.name || specialty.specialization || '') : 
      '';
  };
  
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      setIsLoading(true);
      try {
        // Get doctor ID from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const doctorId = user?.id;
        
        if (!doctorId) {
          toast.error('Doctor ID not found. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        // Fetch doctor profile from backend
        const response = await doctorService.getDoctorById(doctorId);
        console.log('Doctor API response:', response.data);
        
        // Map backend response to our component's state
        const doctorData = response.data;
        
        const formattedProfile = {
          id: doctorData.drId || doctorData.id,
          name: doctorData.drName || doctorData.name,
          specialty: doctorData.specialization || doctorData.specialty || '',
          email: doctorData.emailId || doctorData.email || '',
          phone: doctorData.mobileNo || doctorData.phone || '',
          license: doctorData.license || '',
          age: doctorData.age || '',
          gender: doctorData.gender || '',
          address: doctorData.address || '',
          education: doctorData.education ? 
            (Array.isArray(doctorData.education) ? doctorData.education : [{ degree: doctorData.education, institution: '', year: '' }]) : 
            [],
          experience: doctorData.experience || '',
          languages: doctorData.languages ? 
            (Array.isArray(doctorData.languages) ? doctorData.languages : doctorData.languages.split(',')) : 
            ['English'],
          profileImage: doctorData.picture || doctorData.profileImage || doctorData.image || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
          certifications: doctorData.certifications ? 
            (Array.isArray(doctorData.certifications) ? doctorData.certifications : [doctorData.certifications]) : 
            [],
          hospitalAffiliations: doctorData.hospitalAffiliations ? 
            (Array.isArray(doctorData.hospitalAffiliations) ? doctorData.hospitalAffiliations : [doctorData.hospitalAffiliations]) : 
            [],
          spId: doctorData.spNo || doctorData.spId || doctorData.specialtyId || '',
          status: doctorData.status || 'Active',
          consultationFee: doctorData.consultationFee || doctorData.fee || '',
          availableDays: doctorData.availableDays || '',
          availableHours: doctorData.availableHours || '',
          password: doctorData.password || ''
        };
        
        console.log('Formatted profile data:', formattedProfile);
        console.log('Specialty ID extracted:', formattedProfile.spId);
        
        setProfile(formattedProfile);
        setEditedProfile({...formattedProfile});
        
        // Set specialty name based on spId
        if (formattedProfile.spId) {
          const spName = getSpecialtyName(formattedProfile.spId);
          setSpecialtyName(spName);
        }
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        toast.error('Failed to load doctor profile. Please try again later.');
      }
      setIsLoading(false);
    };
    
    fetchDoctorProfile();
  }, [specializations]); // Re-run when specializations are loaded
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
    
    // Update specialty name when spId changes
    if (name === 'spId') {
      const spName = getSpecialtyName(value);
      setSpecialtyName(spName);
    }
  };
  
  // Handle specialty selection change
  const handleSpecialtyChange = (e) => {
    const selectedSpId = e.target.value;
    console.log("Selected specialty ID:", selectedSpId);
    
    const selectedSpecialty = specializations.find(sp => 
      sp.spId === parseInt(selectedSpId) || 
      sp.id === parseInt(selectedSpId) || 
      sp.spNo === parseInt(selectedSpId) ||
      sp.spId === selectedSpId || 
      sp.id === selectedSpId || 
      sp.spNo === selectedSpId
    );
    
    console.log("Found specialty:", selectedSpecialty);
    
    setEditedProfile({
      ...editedProfile,
      spId: selectedSpId,
      specialty: selectedSpecialty ? (selectedSpecialty.spName || selectedSpecialty.name || '') : ''
    });
    
    setSpecialtyName(selectedSpecialty ? (selectedSpecialty.spName || selectedSpecialty.name || '') : '');
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };
  
  // Save profile changes
  const handleSave = async () => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Saving profile changes...');
      
      // Get doctor ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const doctorId = user?.id;
      
      // Prepare updated profile data for backend
      const updatedProfileData = {
        drId: doctorId,
        drName: editedProfile.name,
        specialization: editedProfile.specialty,
        spNo: parseInt(editedProfile.spId) || 0, // Convert to number and ensure it's sent correctly
        spId: parseInt(editedProfile.spId) || 0, // Include both formats to ensure compatibility
        emailId: editedProfile.email,
        mobileNo: editedProfile.phone,
        age: editedProfile.age,
        gender: editedProfile.gender,
        experience: editedProfile.experience,
        password: profile.password || "placeholder" // Add password to prevent backend validation error
      };
      
      console.log("Sending update data:", updatedProfileData);
      
      // Send update to backend
      await doctorService.updateDoctor(doctorId, updatedProfileData);
      
      // Update local state
      const updatedProfile = {...editedProfile};
      if (previewImage) {
        updatedProfile.profileImage = previewImage;
      }
      setProfile(updatedProfile);
      setIsEditing(false);
      setPreviewImage(null);
      
      // Update success toast
      toast.update(loadingToastId, { 
        render: 'Profile updated successfully!', 
        type: 'success', 
        isLoading: false,
        autoClose: 3000
      });
    } catch (err) {
      console.error('Error updating doctor profile:', err);
      toast.error('Failed to update profile. Please try again.');
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({...profile});
    setPreviewImage(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-3">
              <button 
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-500 h-32 md:h-48">
          <div className="absolute inset-0 opacity-20 bg-pattern-dots"></div>
        </div>
        
        <div className="relative px-6 pb-6">
          {isEditing ? (
            // Edit mode - enhanced form with better styling
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile image */}
              <div className="col-span-2 flex justify-center">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg transition-transform hover:scale-105 duration-300">
                  <img 
                    src={previewImage || editedProfile.profileImage} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <label className="cursor-pointer bg-white rounded-full p-2 hover:bg-gray-100 transition-colors shadow-md">
                      <CameraIcon className="h-6 w-6 text-primary-600" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Form Sections with titles */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-primary-600 mb-4 border-b border-primary-100 pb-2">Basic Information</h3>
              </div>
              
              {/* Basic Info */}
              <div className="group">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="spId" className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                {specializations.length > 0 ? (
                  <div className="relative">
                    <select
                      id="spId"
                      name="spId"
                      value={editedProfile.spId}
                      onChange={handleSpecialtyChange}
                      className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 appearance-none transition-all duration-200"
                    >
                      <option value="">Select Specialty</option>
                      {specializations.map((specialty) => (
                        <option key={specialty.spId || specialty.id} value={specialty.spId || specialty.id}>
                          {specialty.spName || specialty.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={editedProfile.specialty}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                    placeholder="Enter your specialty"
                  />
                )}
              </div>
              
              {/* Section title for Contact Info */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-primary-600 mb-4 border-b border-primary-100 pb-2 mt-2">Contact Information</h3>
              </div>
              
              {/* Contact Info */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={handleChange}
                    className="block w-full pl-10 px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={editedProfile.phone}
                    onChange={handleChange}
                    className="block w-full pl-10 px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                    placeholder="+1 (123) 456-7890"
                  />
                </div>
              </div>
              
              {/* Section title for Personal Details */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-primary-600 mb-4 border-b border-primary-100 pb-2 mt-2">Personal Details</h3>
              </div>
              
              {/* Personal Details */}
              <div className="group">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <div className="relative">
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={editedProfile.age}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                    placeholder="Enter your age"
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    value={editedProfile.gender}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 appearance-none transition-all duration-200"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <div className="relative">
                  <input
                    type="text"
                    id="experience"
                    name="experience"
                    value={editedProfile.experience}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                    placeholder="Years of experience"
                  />
                </div>
              </div>
            </div>
          ) : (
            // View mode - remains the same with all sections
            <div>
              <div className="flex flex-col md:flex-row">
                {/* Profile Image */}
                <div className="relative -mt-16 md:-mt-24 mb-4 md:mb-0 flex justify-center md:block">
                  <div className="relative h-32 w-32 md:h-48 md:w-48 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img 
                      src={profile.profileImage} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Basic Info */}
                <div className="md:ml-8 md:mt-4">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-lg text-primary-600 font-medium">
                    {specialtyName || profile.specialty || 'No specialty specified'}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.languages.map((language, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {language}
                      </span>
                    ))}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {profile.experience}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {profile.email && (
                      <p className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {profile.email}
                      </p>
                    )}
                    {profile.phone && (
                      <p className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {profile.phone}
                      </p>
                    )}
                    {profile.address && (
                      <p className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {profile.address}
                      </p>
                    )}
                    {profile.license && (
                      <p className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        License: {profile.license}
                      </p>
                    )}
                  </div>
                </div>
                
                {isEditing || (profile.hospitalAffiliations && profile.hospitalAffiliations.length > 0) ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Affiliations</h3>
                    <ul className="space-y-2">
                      {profile.hospitalAffiliations.map((hospital, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <svg className="h-4 w-4 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {hospital}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              
              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Education & Training</h3>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-primary-200 pl-4">
                        <p className="font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-gray-600">{edu.institution ? `${edu.institution}, ` : ''}{edu.year || ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Certifications */}
              {profile.certifications && profile.certifications.length > 0 ? (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                  <ul className="space-y-2">
                    {profile.certifications.map((certification, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg className="h-4 w-4 text-primary-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {certification}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              
              {/* Personal Details */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.age && <p className="text-gray-600"><span className="font-medium">Age:</span> {profile.age}</p>}
                  {profile.gender && <p className="text-gray-600"><span className="font-medium">Gender:</span> {profile.gender}</p>}
                  {profile.experience && <p className="text-gray-600"><span className="font-medium">Experience:</span> {profile.experience}</p>}
                  {profile.consultationFee && <p className="text-gray-600"><span className="font-medium">Consultation Fee:</span> {profile.consultationFee}</p>}
                </div>
              </div>
              
              {/* Availability */}
              {profile.availableDays || profile.availableHours ? (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                  <div>
                    {profile.availableDays && <p className="text-gray-600"><span className="font-medium">Days:</span> {profile.availableDays}</p>}
                    {profile.availableHours && <p className="text-gray-600 mt-2"><span className="font-medium">Hours:</span> {profile.availableHours}</p>}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 