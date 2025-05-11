import React, { useState, useEffect } from 'react';
import { 
  UserIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ListBulletIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { doctorService, patientService, specialtyService } from '../../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  console.log("BookAppointment component rendered with patientId:", patientId);
  
  // State for form data
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    mobileNo: '',
    age: '',
    bloodGroup: '',
    description: '',
    specialty: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [confirmPolicy, setConfirmPolicy] = useState(false);
  
  // Data states
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Add state to track the actual patient ID
  const [actualPatientId, setActualPatientId] = useState(patientId);
  
  // Load patient data if patientId is available
  useEffect(() => {
    console.log("useEffect for patientId triggered with id:", patientId);
    
    const fetchPatientData = async () => {
      try {
        // If patientId is in the URL, use it
        if (patientId) {
          console.log("Attempting to load patient data for ID:", patientId);
          setActualPatientId(patientId);
          await loadPatientData(patientId);
        } else {
          // Try to get the current user from localStorage as a fallback
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              if (user.id) {
                console.log("Using current user ID from localStorage:", user.id);
                setActualPatientId(user.id);
                await loadPatientData(user.id);
              }
            } catch (e) {
              console.error("Error parsing user data from localStorage:", e);
              setLoadingPatient(false);
            }
          } else {
            console.log("No patientId provided and no user in localStorage");
            setLoadingPatient(false);
          }
        }
      } catch (error) {
        console.error("Error in fetchPatientData:", error);
        setLoadingPatient(false);
      }
    };

    fetchPatientData();
    loadSpecialties();
  }, [patientId]);
  
  // Load doctors when specialty changes
  useEffect(() => {
    if (formData.specialty) {
      loadDoctorsBySpecialty(formData.specialty);
    }
  }, [formData.specialty]);
  
  // Load doctor details when doctorId changes
  useEffect(() => {
    if (formData.doctorId) {
      loadDoctorDetails(formData.doctorId);
    } else {
      setSelectedDoctor(null);
    }
  }, [formData.doctorId]);
  
  const loadPatientData = async (id) => {
    console.log("loadPatientData called with id:", id);
    try {
      console.log("Making API call to get patient by ID:", id);
      const response = await patientService.getPatientById(id);
      console.log("Patient API response:", response);
      const patient = response.data;
      
      console.log("Loaded patient data:", patient);
      
      if (!patient) {
        console.log("No patient data found in response");
        setLoadingPatient(false);
        return;
      }
      
      // Log all available fields for debugging
      console.log("Available patient fields:", Object.keys(patient));
      
      // Try to find mobile number and blood group with better fallbacks
      const mobileNo = getPatientProperty(patient, 'Mobile_No');
      const bloodGroup = getPatientProperty(patient, 'Blood_Group');
      
      console.log("Retrieved Mobile_No:", mobileNo);
      console.log("Retrieved Blood_Group:", bloodGroup);
      
      // Use our getPatientProperty helper to safely access fields with different casings
      setFormData(prev => ({
        ...prev,
        patientName: getPatientProperty(patient, 'Name') || '',
        email: getPatientProperty(patient, 'Email') || '',
        mobileNo: mobileNo || '',
        age: getPatientProperty(patient, 'Age') || '',
        bloodGroup: bloodGroup || ''
      }));
      
    } catch (error) {
      console.error('Error loading patient data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load patient data');
    } finally {
      setLoadingPatient(false);
    }
  };
  
  // Helper function to safely access nested properties
  const getPatientProperty = (patient, key) => {
    if (!patient) return null;
    
    // Try exact match first
    if (patient[key] !== undefined) return patient[key];
    
    // Try case-insensitive match
    const lowerKey = key.toLowerCase();
    
    // Check for common field name variations
    if (lowerKey === 'mobile_no') {
      // Try common mobile field variations
      const mobileFields = ['mobileNo', 'mobile', 'phone', 'phoneNumber', 'contact', 'contactNo', 'mobile_no'];
      for (const field of mobileFields) {
        if (patient[field] !== undefined) return patient[field];
      }
    } 
    else if (lowerKey === 'blood_group') {
      // Try common blood group field variations
      const bloodGroupFields = ['bloodGroup', 'bloodType', 'blood', 'blood_group'];
      for (const field of bloodGroupFields) {
        if (patient[field] !== undefined) return patient[field];
      }
    }
    
    const keys = Object.keys(patient);
    const matchingKey = keys.find(k => k.toLowerCase() === lowerKey);
    
    return matchingKey ? patient[matchingKey] : null;
  };
  
  const loadSpecialties = async () => {
    console.log("loadSpecialties function called");
    try {
      console.log("Making API call to get all specialties");
      const response = await specialtyService.getAllSpecialties();
      console.log("Specialties API response:", response);
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error loading specialties:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load specialties');
    } finally {
      setLoadingSpecialties(false);
    }
  };
  
  const loadDoctorsBySpecialty = async (specialtyId) => {
    console.log("loadDoctorsBySpecialty called with specialtyId:", specialtyId);
    setLoadingDoctors(true);
    setDoctors([]); // Clear previous doctors
    setSelectedDoctor(null); // Reset selected doctor
    setFormData(prev => ({ ...prev, doctorId: '' })); // Reset doctor selection
    
    try {
      // Map the specialtyId field correctly
      const response = await doctorService.getDoctorsBySpecialty(specialtyId);
      console.log("Doctors API response:", response);
      
      if (response.data) {
        // Add debug logging to inspect doctor data structure
        console.log("Doctor data structure sample:", response.data[0]);
        
        // Sort doctors by name for better user experience
        const sortedDoctors = [...response.data].sort((a, b) => {
          const nameA = (a.Name || a.name || a.firstName || "").toLowerCase();
          const nameB = (b.Name || b.name || b.firstName || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        
        setDoctors(sortedDoctors);
        console.log("Set doctors state with:", sortedDoctors);
        
        // If only one doctor is available, auto-select them
        if (sortedDoctors.length === 1) {
          const doctorId = sortedDoctors[0].DR_ID || sortedDoctors[0].id || sortedDoctors[0].drId;
          setFormData(prev => ({ ...prev, doctorId: doctorId.toString() }));
          loadDoctorDetails(doctorId);
        }
      } else {
        console.log("No doctors data found in response");
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load doctors for this specialty');
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };
  
  const loadDoctorDetails = async (doctorId) => {
    console.log("loadDoctorDetails called with doctorId:", doctorId);
    try {
      console.log("Making API call to get doctor details:", doctorId);
      const response = await doctorService.getDoctorById(doctorId);
      console.log("Doctor details API response:", response);
      setSelectedDoctor(response.data);
    } catch (error) {
      console.error('Error loading doctor details:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load doctor details');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission initiated with form data:", formData);
    
    if (!confirmPolicy) {
      toast.warning('Please confirm the appointment policy');
      return;
    }
    
    // Validate form
    const requiredFields = ['patientName', 'email', 'mobileNo', 'description', 'specialty', 'doctorId', 'appointmentDate', 'appointmentTime'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setLoading(true);
    
    try {
      // If we already have a patient ID (from URL or localStorage), use it
      let patientIdToUse = actualPatientId;
      
      if (!patientIdToUse) {
        console.log("No patient ID from URL or localStorage, attempting to look up by email:", formData.email);
        try {
          const response = await patientService.findPatientByEmail(formData.email);
          console.log("Email lookup response:", response);
          if (response.data && (response.data.P_ID || response.data.id || response.data.pId)) {
            patientIdToUse = response.data.P_ID || response.data.id || response.data.pId;
            console.log("Found patient ID by email lookup:", patientIdToUse);
          } else {
            console.log("No patient found with email:", formData.email);
            toast.error('Could not find patient record. Please contact support.');
            setLoading(false);
            return;
          }
        } catch (emailLookupError) {
          console.error("Error looking up patient by email:", emailLookupError);
          toast.error('Error finding patient record. Please contact support.');
          setLoading(false);
          return;
        }
      }
      
      if (!patientIdToUse) {
        console.log("Using current user ID from localStorage as last fallback");
        // Try to get the current user ID from localStorage as a last fallback
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.id) {
              patientIdToUse = user.id;
              console.log("Using current user ID:", patientIdToUse);
            }
          } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
          }
        }
        
        // If still no ID, return an error
        if (!patientIdToUse) {
          toast.error('Could not determine patient ID. Please log in again.');
          setLoading(false);
          return;
        }
      }
      
      // If we successfully found a patient ID
      console.log("Using patient ID for appointment:", patientIdToUse);
      
      // Convert IDs to numbers and ensure they're valid
      const patientIdNum = parseInt(patientIdToUse);
      const doctorIdNum = parseInt(formData.doctorId);
      
      // Add debugging to track the exact patient ID value
      console.log("Patient ID after conversion:", patientIdNum, "Type:", typeof patientIdNum);
      
      // Verify this is a valid numeric ID
      if (isNaN(patientIdNum) || patientIdNum <= 0) {
        console.error("Invalid patient ID:", patientIdNum);
        toast.error('Invalid patient ID. Please try again.');
        setLoading(false);
        return;
      }
      
      if (isNaN(doctorIdNum) || doctorIdNum <= 0) {
        console.error("Invalid doctor ID:", doctorIdNum);
        toast.error('Please select a valid doctor.');
        setLoading(false);
        return;
      }
      
      // Format date in different format than the input field provides
      // Try to match exact expected format for both date and time
      // Java expects date in yyyy-MM-dd format and time in HH:mm:ss format
      const formattedDate = formData.appointmentDate; // Already in yyyy-MM-dd format
      const formattedTime = formData.appointmentTime + ":00"; // Add seconds to make it HH:mm:ss
      
      console.log("Using formatted date:", formattedDate, "and time:", formattedTime);
      
      // Include all fields, especially date and time with proper formatting
      const appointmentData = {
        pId: patientIdNum,
        drId: doctorIdNum, 
        descript: formData.description,
        cancelConfirm: 0,
        appointmentDate: formattedDate,  // Ensure this is in yyyy-MM-dd format
        appointmentTime: formattedTime,  // Ensure this is in HH:mm:ss format
        status: "PENDING"
      };
      
      console.log("Attempting with properly formatted date and time:", appointmentData);
      
      // Use XMLHttpRequest for more direct control
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8080/api/appointments', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("Success response:", xhr.responseText);
            toast.success('Appointment booked successfully!');
            navigate('/patient/appointments');
          } else {
            console.error("Error response:", xhr.status, xhr.responseText);
            
            // Try an alternative approach with all fields
            const fullData = {
              pId: patientIdNum,
              drId: doctorIdNum,
              descript: formData.description,
              cancelConfirm: 0,
              appointmentDate: formattedDate,
              appointmentTime: formattedTime,
              status: "PENDING"
            };
            
            console.log("Trying with all fields and exact formats:", fullData);
            
            // Use direct fetch as alternative
            fetch('http://localhost:8080/api/appointments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(fullData)
            })
            .then(response => response.text())
            .then(text => {
              console.log("Second attempt response:", text);
              if (text && text.includes("apId")) {
                // If response contains apId, consider it successful
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
              } else {
                toast.error('Failed to book appointment. Please try again later.');
              }
            })
            .catch(err => {
              console.error("Second attempt failed:", err);
              toast.error('Failed to book appointment: ' + err.message);
            });
          }
        };
        xhr.onerror = function() {
          console.error("Network error occurred");
          toast.error('Network error occurred. Please check your connection.');
        };
        xhr.send(JSON.stringify(appointmentData));
      } catch (error) {
        console.error("Error submitting appointment:", error);
        toast.error('Error submitting appointment: ' + error.message);
      }
    } catch (error) {
      console.error("Error in appointment process:", error);
      toast.error('Error processing appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-8 p-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Patient Information Form */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Patient Information</h2>
            {loadingPatient ? (
              <div className="text-center py-4">Loading patient information...</div>
            ) : (
              <>
                {(formData.patientName || formData.email || formData.mobileNo) && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="h-8 w-8 flex-shrink-0 mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Patient data loaded</h4>
                        <p className="text-xs text-green-700 mt-1">Information has been automatically filled for:</p>
                        <ul className="mt-2 text-xs text-green-700 space-y-1">
                          <li className="flex items-center">
                            <span className="mr-2">•</span>
                            <strong>Name:</strong> <span className="ml-1">{formData.patientName || "Not available"}</span>
                          </li>
                          {formData.mobileNo && (
                            <li className="flex items-center">
                              <span className="mr-2">•</span>
                              <strong>Mobile:</strong> <span className="ml-1">{formData.mobileNo}</span>
                            </li>
                          )}
                          {formData.bloodGroup && (
                            <li className="flex items-center">
                              <span className="mr-2">•</span>
                              <strong>Blood Group:</strong> <span className="ml-1">{formData.bloodGroup}</span>
                            </li>
                          )}
                          {formData.age && (
                            <li className="flex items-center">
                              <span className="mr-2">•</span>
                              <strong>Age:</strong> <span className="ml-1">{formData.age} years</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name *
                      {formData.patientName && <span className="ml-2 text-xs text-green-500">(Auto-filled)</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="patientName"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleChange}
                        className={`pl-10 w-full border ${formData.patientName ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                        placeholder="Enter full name"
                        readOnly={formData.patientName ? true : false}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                      {formData.email && <span className="ml-2 text-xs text-green-500">(Auto-filled)</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-10 w-full border ${formData.email ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                        placeholder="Enter email address"
                        readOnly={formData.email ? true : false}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number * 
                      {formData.mobileNo && <span className="ml-2 text-xs text-green-500">(Auto-filled)</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="mobileNo"
                        name="mobileNo"
                        value={formData.mobileNo}
                        onChange={handleChange}
                        className={`pl-10 w-full border ${formData.mobileNo ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                        placeholder="Enter mobile number"
                        readOnly={formData.mobileNo ? true : false}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                      {formData.age && <span className="ml-2 text-xs text-green-500">(Auto-filled)</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="0"
                        max="120"
                        className={`pl-10 w-full border ${formData.age ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                        placeholder="Enter age"
                        readOnly={formData.age ? true : false}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                      {formData.bloodGroup && <span className="ml-2 text-xs text-green-500">(Auto-filled)</span>}
                    </label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className={`w-full border ${formData.bloodGroup ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-lg py-3 pl-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none`}
                      disabled={formData.bloodGroup ? true : false}
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description of Symptoms/Issue *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <ListBulletIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="pl-10 w-full border border-gray-300 rounded-lg py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Please describe your symptoms or reason for visit"
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Appointment Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Appointment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Specialty *
                </label>
                <select
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-3 pl-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                  required
                  disabled={loadingSpecialties}
                >
                  <option value="">Select Specialty</option>
                  {specialties && specialties.length > 0 ? (
                    specialties.map((specialty) => (
                      <option key={specialty.spId || specialty.id || specialty.S_ID} 
                              value={specialty.spId || specialty.id || specialty.S_ID}>
                        {specialty.spName || specialty.name || specialty.Specialization}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No specialties available</option>
                  )}
                </select>
                {loadingSpecialties && <p className="text-sm text-gray-500 mt-1">Loading specialties...</p>}
                {!loadingSpecialties && specialties.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">No specialties found. Please try again later.</p>
                )}
                {formData.specialty && (
                  <p className="text-xs text-primary-600 mt-1">
                    {loadingDoctors 
                      ? "Loading doctors for this specialty..." 
                      : doctors.length > 0 
                        ? `${doctors.length} doctor${doctors.length > 1 ? 's' : ''} available` 
                        : "No doctors available for this specialty"}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor *
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className={`w-full border ${loadingDoctors ? 'bg-gray-100' : ''} border-gray-300 rounded-lg py-3 pl-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none`}
                  required
                  disabled={loadingDoctors || !formData.specialty}
                >
                  <option value="">Select a Doctor</option>
                  {doctors && doctors.length > 0 ? (
                    doctors.map((doctor) => {
                      const id = doctor.DR_ID || doctor.id || doctor.drId;
                      const name = doctor.Name || doctor.name || doctor.drName || doctor.firstName || doctor.doctorName || "Dr.";
                      const fee = doctor.fee || doctor.Fees || doctor.fees;
                      const specialization = doctor.Specialization || doctor.specialization || doctor.specialty;
                      return (
                        <option key={id} value={id}>
                          {name} {specialization && `(${specialization})`} {fee && ` - Fee: $${fee}`}
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>No doctors available</option>
                  )}
                </select>
                {loadingDoctors && <p className="text-sm text-gray-500 mt-1">Loading doctors...</p>}
                {!loadingDoctors && doctors.length === 0 && formData.specialty && (
                  <p className="text-sm text-red-500 mt-1">No doctors found for this specialty</p>
                )}
                {!formData.specialty && <p className="text-sm text-gray-500 mt-1">Please select a specialty first</p>}
              </div>
              
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} // Today or later
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Time *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select Time</option>
                    {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'].map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Details - Only shown when a doctor is selected */}
          {selectedDoctor && (
            <div className="mb-8 bg-primary-50 rounded-xl p-4 border border-primary-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h2>
              
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mr-4 border-2 border-white shadow-md">
                  {selectedDoctor.image ? (
                    <img 
                      src={`data:image/jpeg;base64,${selectedDoctor.image}`} 
                      alt={selectedDoctor.Name || selectedDoctor.name} 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    {selectedDoctor.Name || selectedDoctor.name || selectedDoctor.drName || selectedDoctor.firstName || selectedDoctor.doctorName || "Dr."}
                  </h3>
                  <p className="text-sm text-primary-600">
                    {selectedDoctor.Specialization || selectedDoctor.specialization || 
                     selectedDoctor.specialty || "Specialist"}
                  </p>
                  <div className="flex items-center mt-1">
                    {(selectedDoctor.Experience || selectedDoctor.experience) && (
                      <>
                        <span className="text-sm text-gray-700">
                          Experience: {selectedDoctor.Experience || selectedDoctor.experience} years
                        </span>
                        <span className="mx-2 text-gray-300">•</span>
                      </>
                    )}
                    {(selectedDoctor.Fees || selectedDoctor.fees || selectedDoctor.fee) && (
                      <span className="font-medium text-gray-900">
                        Fee: ${selectedDoctor.Fees || selectedDoctor.fees || selectedDoctor.fee}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Confirm Button */}
          <div className="mt-8">
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={confirmPolicy}
                  onChange={() => setConfirmPolicy(!confirmPolicy)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I confirm that the information provided is accurate and I agree to the appointment policies
                </span>
              </label>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || !confirmPolicy}
                className={`px-8 py-4 bg-primary-600 text-white font-medium text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg transition-all duration-200 ${
                  loading || !confirmPolicy 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-primary-700 hover:shadow-xl'
                }`}
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment; 