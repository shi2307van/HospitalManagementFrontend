import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LockClosedIcon, 
  UserIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  PhoneIcon,
  CalendarDaysIcon,
  MapPinIcon,
  EnvelopeIcon,
  UserCircleIcon,
  CheckCircleIcon,
  PencilIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { registerUser } from '../../services/api';

// Static mockup data
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const steps = [
  { id: 1, name: 'Personal', icon: UserCircleIcon },
  { id: 2, name: 'Contact', icon: PhoneIcon },
  { id: 3, name: 'Account', icon: LockClosedIcon },
];

const Register = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    bloodGroup: '',
    medicalHistory: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock navigation functions - only for UI demonstration
  const goToNextStep = () => setCurrentStep(current => Math.min(current + 1, steps.length));
  const goToPrevStep = () => setCurrentStep(current => Math.max(current - 1, 1));
  
  const showSuccessAndRedirect = (e) => {
    e.preventDefault();
    setShowSuccessAnimation(true);
    // No actual redirect
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Prepare the data for API submission
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        medicalHistory: formData.medicalHistory
      };

      await registerUser(userData);
      setShowSuccessAnimation(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-50 rounded-full opacity-70 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-50 rounded-full opacity-60 blur-3xl"></div>
      <div className="absolute top-1/3 right-0 w-32 h-32 bg-accent-light opacity-20 rounded-full blur-xl"></div>
      
      {/* Logo and title */}
      <div className="z-10 mb-4 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-xl mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-2xl"></div>
          <svg className="w-8 h-8 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent-DEFAULT rounded-full"></div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">Join HealthConnect in a few easy steps</p>
      </div>
      
      {/* Main container */}
      <div className="w-full max-w-4xl z-10">
        {/* Progress tracker */}
        <div className="mb-8 px-4">
          <div className="relative flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <button 
                  onClick={() => index < currentStep ? setCurrentStep(step.id) : null}
                  className={`flex items-center justify-center h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${
                    currentStep === step.id
                      ? 'bg-primary-500 text-white scale-110 shadow-primary-500/30'
                      : currentStep > step.id
                      ? 'bg-white text-primary-500 border-2 border-primary-500'
                      : 'bg-white text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </button>
                <span className={`mt-2 text-sm font-medium ${
                  currentStep === step.id
                    ? 'text-primary-500'
                    : currentStep > step.id
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="absolute h-1 top-6 -z-10" style={{ 
                    left: `${(index * 100) / (steps.length - 1) + 6}%`, 
                    right: `${100 - ((index + 1) * 100) / (steps.length - 1) + 6}%`
                  }}>
                    <div className={`h-full ${
                      currentStep > index + 1 ? 'bg-primary-500' : 'bg-gray-200'
                    } rounded-full transition-colors duration-500`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Form container with 3D neumorphic effect */}
        <div className="bg-white rounded-3xl shadow-lg relative overflow-hidden transform transition-all">
          {/* 3D perspective effect */}
          <div className={`absolute inset-0 bg-gradient-to-br from-gray-50 via-transparent to-gray-100 opacity-80 pointer-events-none perspective-effect
            ${currentStep === 1 ? "perspective-left" : currentStep === 3 ? "perspective-right" : ""}`}></div>
          
          {/* Success animation overlay */}
          {showSuccessAnimation && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-30">
              <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center animate-ping absolute"></div>
              <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center animate-pulse">
                <CheckCircleIcon className="h-10 w-10 text-white" />
              </div>
              <p className="absolute mt-24 text-lg font-medium text-primary-600">Registration Successful!</p>
            </div>
          )}
          
          {/* Form content */}
          <div className="relative p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              <div className={`transition-all duration-500 transform ${currentStep === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute'}`}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <UserCircleIcon className="h-6 w-6 mr-2 text-primary-500" />
                    Personal Information
                  </h2>
                  <p className="text-gray-600 mt-1">Tell us about yourself</p>
                </div>
                
                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="form-floating">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="form-input"
                      placeholder=""
                      value={formData.username}
                      onChange={handleChange}
                    />
                    <label htmlFor="username" className="form-label">Full Name</label>
                    <UserIcon className="form-icon" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Date of Birth - Simple UI version */}
                    <div className="form-floating">
                      <input
                        id="dob"
                        name="dateOfBirth"
                        type="date"
                        required
                        className="form-input"
                        max={new Date().toISOString().split('T')[0]}
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                      <label htmlFor="dob" className="form-label">Date of Birth</label>
                    </div>
                    
                    {/* Age - Normal input field */}
                    <div className="form-floating">
                      <input
                        id="age"
                        name="age"
                        type="number"
                        required
                        className="form-input"
                        placeholder=""
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={handleChange}
                      />
                      <label htmlFor="age" className="form-label">Age</label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Gender */}
                    <div className="form-floating">
                      <select
                        id="gender"
                        name="gender"
                        defaultValue="male"
                        className="form-input"
                        required
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <label htmlFor="gender" className="form-label">Gender</label>
                      <ChevronDownIcon className="form-icon" />
                    </div>
                    
                    {/* Blood Group */}
                    <div className="form-floating">
                      <select
                        id="blood_group"
                        name="bloodGroup"
                        defaultValue=""
                        className="form-input"
                        required
                        value={formData.bloodGroup}
                        onChange={handleChange}
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                      <label htmlFor="blood_group" className="form-label">Blood Group</label>
                      <ChevronDownIcon className="form-icon" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Step 2: Contact Information */}
              <div className={`transition-all duration-500 transform ${currentStep === 2 ? 'opacity-100 translate-x-0' : currentStep < 2 ? 'opacity-0 translate-x-full absolute' : 'opacity-0 -translate-x-full absolute'}`}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <PhoneIcon className="h-6 w-6 mr-2 text-primary-500" />
                    Contact Information
                  </h2>
                  <p className="text-gray-600 mt-1">How can we reach you?</p>
                </div>
                
                <div className="space-y-6">
                  {/* Mobile Number */}
                  <div className="form-floating">
                    <input
                      id="mobile"
                      name="phoneNumber"
                      type="tel"
                      required
                      className="form-input"
                      placeholder=""
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                    <label htmlFor="mobile" className="form-label">Mobile Number</label>
                    <PhoneIcon className="form-icon" />
                  </div>
                  
                  {/* Address */}
                  <div className="form-floating">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      required
                      className="form-input !h-32 pt-6"
                      placeholder=""
                      value={formData.address}
                      onChange={handleChange}
                    ></textarea>
                    <label htmlFor="address" className="form-label">Address</label>
                    <MapPinIcon className="form-icon" />
                  </div>
                </div>
              </div>
              
              {/* Step 3: Account Information */}
              <div className={`transition-all duration-500 transform ${currentStep === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute'}`}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <LockClosedIcon className="h-6 w-6 mr-2 text-primary-500" />
                    Account Setup
                  </h2>
                  <p className="text-gray-600 mt-1">Create your login credentials</p>
                </div>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="form-floating">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="form-input"
                      placeholder=""
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <EnvelopeIcon className="form-icon" />
                  </div>
                  
                  {/* Password */}
                  <div className="form-floating">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="form-input"
                      placeholder=""
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <label htmlFor="password" className="form-label">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="form-icon-btn"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="form-floating">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="form-input"
                      placeholder=""
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="form-icon-btn"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Terms & Conditions */}
                  <div className="flex items-center pl-2">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">Terms of Service</a> and <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Form actions */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ArrowLeftIcon className="mr-2 h-5 w-5" />
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Continue
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        {/* Already have an account */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Custom styles */}
      <style jsx>{`
        .form-floating {
          position: relative;
        }
        
        .form-input {
          display: block;
          width: 100%;
          height: 56px;
          padding: 1.25rem 2.5rem 0.5rem 1rem;
          font-size: 1rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .form-input:focus {
          border-color: #14B8A6;
          outline: 0;
          box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.25);
        }
        
        .form-label {
          position: absolute;
          top: 0;
          left: 1rem;
          height: 100%;
          padding: 1rem 0;
          pointer-events: none;
          border: none;
          transform-origin: 0 0;
          transition: opacity .15s ease-in-out, transform .15s ease-in-out;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .form-input:focus ~ .form-label,
        .form-input:not(:placeholder-shown) ~ .form-label {
          opacity: 0.8;
          transform: scale(0.85) translateY(-0.5rem);
        }
        
        .form-icon {
          position: absolute;
          right: 1rem;
          top: 1rem;
          color: #9ca3af;
          width: 1.25rem;
          height: 1.25rem;
          pointer-events: none;
        }
        
        .form-icon-btn {
          position: absolute;
          right: 1rem;
          top: 1rem;
          color: #9ca3af;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        
        .form-icon-btn:hover {
          color: #6b7280;
        }
        
        .perspective-effect {
          transition: opacity 0.5s ease-in-out;
        }
        
        .perspective-left {
          background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0));
        }
        
        .perspective-right {
          background: linear-gradient(225deg, rgba(255,255,255,0.5), rgba(255,255,255,0));
        }
      `}</style>
    </div>
  );
};

export default Register; 