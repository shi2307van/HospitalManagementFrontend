import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LockClosedIcon, 
  UserIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  EnvelopeIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  HeartIcon,
  BeakerIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { patientService, appointmentService, prescriptionService } from '../services/api';
import confetti from 'canvas-confetti';

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const totalSteps = 3;
  
  const [patient, setPatient] = useState({
    name: '',
    dob: '',
    age: '',
    gender: 'Male',
    bloodGroup: '',
    mobileNo: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [progressPercentage, setProgressPercentage] = useState(33);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    // Update progress percentage based on current step
    setProgressPercentage((currentStep / totalSteps) * 100);
  }, [currentStep]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem('user');
        const userData = JSON.parse(userStr);
        const patientId = userData.id;

        // Fetch appointments and prescriptions for this patient
        const apptRes = await appointmentService.getAppointmentsByPatient(patientId);
        const presRes = await prescriptionService.getPrescriptionsByPatient(patientId);

        setAppointments(apptRes.data || []);
        setPrescriptions(presRes.data || []);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate the estimated completion date for patient onboarding
  const getEstimatedActivationDate = () => {
    const today = new Date();
    const activationDate = new Date(today);
    activationDate.setDate(today.getDate() + 1); // Assuming 1 day for activation
    return activationDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!patient.name) newErrors.name = 'Name is required';
      if (!patient.dob) newErrors.dob = 'Date of Birth is required';
      if (!patient.age) newErrors.age = 'Age is required';
      if (patient.age && (isNaN(patient.age) || parseInt(patient.age) <= 0)) {
        newErrors.age = 'Age must be a positive number';
      }
      if (!patient.bloodGroup) newErrors.bloodGroup = 'Blood Group is required';
    }
    
    if (step === 2) {
      if (!patient.mobileNo) newErrors.mobileNo = 'Mobile Number is required';
      if (!/^\d{10}$/.test(patient.mobileNo)) newErrors.mobileNo = 'Mobile Number must be 10 digits';
      if (!patient.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(patient.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!patient.address) newErrors.address = 'Address is required';
    }
    
    if (step === 3) {
      if (!patient.password) {
        newErrors.password = 'Password is required';
      } else if (patient.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (patient.password !== patient.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setDirection(1);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient({ ...patient, [name]: value });
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    try {
      setLoading(true);
      
      // Remove confirmPassword as it's not needed in the API
      const patientData = { ...patient };
      delete patientData.confirmPassword;
      
      // Register the patient using our service
      await patientService.createPatient(patientData);
      
      // Show success with confetti
      triggerConfetti();
      toast.success('Registration successful! Welcome to HealthConnect.');
      
      // Redirect after a short delay to see the confetti
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { 
        duration: 0.3 
      }
    })
  };

  // Define step icons
  const stepIcons = [
    { icon: UserCircleIcon, name: 'Personal' },
    { icon: MapPinIcon, name: 'Contact' },
    { icon: LockClosedIcon, name: 'Account' }
  ];

  const getBackgroundPattern = () => {
    return (
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Medical-themed pattern */}
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heartbeat" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 30 L20 10 M10 20 L30 20" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heartbeat)" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-50 to-gray-50 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-60 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-100 rounded-full opacity-60 blur-3xl"></div>
      
      {/* Floating animated medical icons */}
      <div className="absolute top-1/4 left-10 w-20 h-20 text-primary-300 opacity-20 animate-float">
        <HeartIcon className="w-full h-full" />
      </div>
      <div className="absolute bottom-1/4 right-10 w-16 h-16 text-secondary-300 opacity-20 animate-float-delayed">
        <BeakerIcon className="w-full h-full" />
      </div>
      <div className="absolute top-3/4 left-1/4 w-12 h-12 text-accent-DEFAULT opacity-20 animate-float-slow">
        <ShieldCheckIcon className="w-full h-full" />
      </div>
      
      {/* Background pattern */}
      {getBackgroundPattern()}
      
      {/* Logo and title */}
      <div className="z-10 mb-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white shadow-2xl mb-6 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-2xl"></div>
          <svg className="w-10 h-10 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent-DEFAULT rounded-full"></div>
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
        >
          Create Your HealthConnect Account
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600"
        >
          Join our community of patients and take control of your healthcare journey
        </motion.p>
      </div>
      
      {/* Main container */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="w-full max-w-4xl z-10"
      >
        {/* Progress tracker */}
        <div className="mb-8 relative">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary-500"
            ></motion.div>
          </div>
          
          <div className="relative flex items-center justify-between mt-4">
            {stepIcons.map((step, index) => {
              const stepNum = index + 1;
              const StepIcon = step.icon;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              
              return (
                <div key={stepNum} className="flex flex-col items-center">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-primary-500 text-white scale-110 shadow-primary-500/30'
                        : isCompleted
                        ? 'bg-white text-primary-500 border-2 border-primary-500'
                        : 'bg-white text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="h-7 w-7" />
                    ) : (
                      <StepIcon className="h-7 w-7" />
                    )}
                  </motion.div>
                  <span className={`mt-2 text-sm font-medium ${
                    isActive || isCompleted
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Form container with 3D effect */}
        <div className="bg-white rounded-3xl shadow-xl relative overflow-hidden transform transition-all hover:shadow-2xl">
          {/* 3D perspective effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-transparent to-gray-100 opacity-80 pointer-events-none"></div>
          
          {/* Form content */}
          <div className="relative p-8">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {/* Form steps */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <UserCircleIcon className="h-6 w-6 mr-2 text-primary-500" />
                        Personal Information
                      </h2>
                      <p className="text-gray-600 mt-1">Tell us about yourself</p>
                    </div>
                    
                    {/* Full Name */}
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`form-input pl-10 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                          name="name"
                          value={patient.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                        />
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {/* Date of Birth */}
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <div className="relative">
                          <input
                            type="date"
                            className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.dob ? 'border-red-500' : 'border-gray-300'}`}
                            name="dob"
                            value={patient.dob}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                          />
                          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                      </div>

                      {/* Age */}
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <div className="relative">
                          <input
                            type="number"
                            className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                            name="age"
                            value={patient.age}
                            onChange={handleChange}
                            placeholder="25"
                            min="1"
                            max="120"
                          />
                          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                      </div>

                      {/* Gender */}
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <div className="relative">
                          <select
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                            name="gender"
                            value={patient.gender}
                            onChange={handleChange}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Blood Group */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <div className="relative">
                        <select
                          className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none ${errors.bloodGroup ? 'border-red-500' : 'border-gray-300'}`}
                          name="bloodGroup"
                          value={patient.bloodGroup}
                          onChange={handleChange}
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
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L9 9H15L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {errors.bloodGroup && <p className="text-red-500 text-sm mt-1">{errors.bloodGroup}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <MapPinIcon className="h-6 w-6 mr-2 text-primary-500" />
                        Contact Information
                      </h2>
                      <p className="text-gray-600 mt-1">How can we reach you?</p>
                    </div>
                    
                    {/* Mobile Number */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.mobileNo ? 'border-red-500' : 'border-gray-300'}`}
                          name="mobileNo"
                          value={patient.mobileNo}
                          onChange={handleChange}
                          placeholder="1234567890"
                        />
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.mobileNo && <p className="text-red-500 text-sm mt-1">{errors.mobileNo}</p>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                          name="email"
                          value={patient.email}
                          onChange={handleChange}
                          placeholder="johndoe@example.com"
                        />
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Address */}
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <div className="relative">
                        <textarea
                          className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                          name="address"
                          value={patient.address}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Your full address"
                        ></textarea>
                        <MapPinIcon className="absolute left-3 top-6 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <LockClosedIcon className="h-6 w-6 mr-2 text-primary-500" />
                        Account Security
                      </h2>
                      <p className="text-gray-600 mt-1">Set your secure password</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* Password */}
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            name="password"
                            value={patient.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                          />
                          <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500 focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className={`w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                            name="confirmPassword"
                            value={patient.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                          />
                          <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-500 focus:outline-none"
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h3 className="font-medium text-gray-700 mb-2">Registration Summary</h3>
                      <p className="text-sm text-gray-600">
                        You're about to create an account with the information provided. You'll be able to:
                      </p>
                      <ul className="mt-2 text-sm text-gray-600 space-y-1">
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-primary-500 mr-2" />
                          Book appointments with doctors
                        </li>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-primary-500 mr-2" />
                          View your medical records securely
                        </li>
                        <li className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 text-primary-500 mr-2" />
                          Receive timely healthcare notifications
                        </li>
                      </ul>
                      <p className="mt-3 text-sm text-gray-600">
                        Expected account activation: <span className="font-medium text-primary-600">{getEstimatedActivationDate()}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-10 flex justify-between">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200"
                    >
                      <ArrowLeftIcon className="h-5 w-5 mr-1" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div></div> 
                  )}
                  
                  {currentStep < totalSteps ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={nextStep}
                      className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors duration-200"
                    >
                      <span>Continue</span>
                      <ArrowRightIcon className="h-5 w-5 ml-1" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center px-6 py-2 bg-accent-DEFAULT text-white rounded-lg shadow hover:bg-accent-dark transition-colors duration-200"
                    >
                      {loading ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <span>Complete Registration</span>
                          <CheckCircleIcon className="h-5 w-5 ml-1" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientRegistration; 