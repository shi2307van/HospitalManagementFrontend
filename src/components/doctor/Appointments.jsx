import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockOutlineIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { appointmentService, patientService, API_BASE_URL } from '../../services/api';
import { toast } from 'react-toastify';
import PrescriptionForm from './PrescriptionForm';
import axios from 'axios';

// Common medications list for autocomplete
const commonMedications = [
  { name: "Acetaminophen (Tylenol)", dosages: ["500mg", "650mg", "1000mg"], frequencies: ["Every 4-6 hours as needed", "Three times daily", "Four times daily"] },
  { name: "Ibuprofen (Advil, Motrin)", dosages: ["200mg", "400mg", "600mg", "800mg"], frequencies: ["Every 4-6 hours as needed", "Three times daily with food"] },
  { name: "Amoxicillin", dosages: ["250mg", "500mg", "875mg"], frequencies: ["Every 8 hours", "Every 12 hours", "Three times daily"] },
  { name: "Azithromycin", dosages: ["250mg", "500mg"], frequencies: ["Once daily for 5 days", "First day: 500mg, then 250mg daily for 4 days"] },
  { name: "Lisinopril", dosages: ["5mg", "10mg", "20mg", "40mg"], frequencies: ["Once daily"] },
  { name: "Atorvastatin (Lipitor)", dosages: ["10mg", "20mg", "40mg", "80mg"], frequencies: ["Once daily at bedtime"] },
  { name: "Metformin", dosages: ["500mg", "850mg", "1000mg"], frequencies: ["Once daily with meals", "Twice daily with meals"] },
  { name: "Amlodipine", dosages: ["2.5mg", "5mg", "10mg"], frequencies: ["Once daily"] },
  { name: "Albuterol Inhaler", dosages: ["1-2 puffs"], frequencies: ["Every 4-6 hours as needed", "Before exercise"] },
  { name: "Prednisone", dosages: ["5mg", "10mg", "20mg", "40mg"], frequencies: ["Once daily", "Twice daily"] }
];

const Appointments = () => {
  const location = useLocation();
  const initialTab = location.state?.selectedTab || 'today';
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for holding fetched appointments
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState({
    today: [],
    upcoming: [],
    past: []
  });
  
  // State for details modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);

  // State for prescription modal - simplified version
  const [showSimplePrescriptionForm, setShowSimplePrescriptionForm] = useState(false);
  
  // Comment out the old prescription state since we're not using it
  /*
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescription, setPrescription] = useState({
    patientId: "",
    doctorId: "",
    appointmentId: "",
    date: new Date().toISOString().split('T')[0],
    medications: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    notes: ""
  });
  const [medicationSuggestions, setMedicationSuggestions] = useState([]);
  const [dosageSuggestions, setDosageSuggestions] = useState([]);
  const [frequencySuggestions, setFrequencySuggestions] = useState([]);
  const [activeMedicationInput, setActiveMedicationInput] = useState(null);
  */

  // Get doctor ID from local storage
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get doctor ID from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('User data not found. Please log in again.');
        }
        
        const userData = JSON.parse(userStr);
        console.log('User data from localStorage:', userData);
        
        if (!userData.id) {
          throw new Error('Doctor ID not found. Please log in again.');
        }
        
        // Fetch appointments for this doctor
        const response = await appointmentService.getAppointmentsByDoctor(userData.id);
        console.log('Raw appointments response:', response);
        
        if (response.data) {
          const fetchedAppointments = response.data;
          
          // Log the first appointment to examine its structure
          if (fetchedAppointments.length > 0) {
            console.log('Sample appointment data structure:', JSON.stringify(fetchedAppointments[0], null, 2));
          }
          
          setAllAppointments(fetchedAppointments);
          
          // Process appointments for display
          processAppointments(fetchedAppointments);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err.message || 'Failed to load appointments');
        toast.error(`Error: ${err.message || 'Failed to load appointments'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  // Process and categorize appointments
  const processAppointments = (appointments) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = today.toDateString();
    
    const processed = {
      today: [],
      upcoming: [],
      past: []
    };
    
    appointments.forEach(appt => {
      try {
        // Extract patient details
        const patientName = appt.patientName || 
                          (appt.patient ? appt.patient.name : 'Patient');
        
        // Extract patient ID from all possible field names
        const patientId = 
          appt.pId || 
          appt.patientId || 
          (appt.patient && appt.patient.id) ||
          (appt.patient && appt.patient.patientId) ||
          (appt.patient && appt.patient.pId) ||
          'N/A';
          
        // Log patient ID extraction for debugging
        console.log('Processing appointment - extracted patient ID:', patientId);
        console.log('Raw appointment data:', appt);
        
        // Extract patient age - check for all possible field names
        const patientAge = 
          appt.patientAge || 
          (appt.patient && appt.patient.age) || 
          (appt.patient && appt.patient.patientAge) ||
          (appt.patient && appt.patient.patientDetails && appt.patient.patientDetails.age) ||
          (appt.patient && appt.patient.details && appt.patient.details.age) ||
          (appt.pId && localStorage.getItem(`patient_${appt.pId}_age`)) ||
          (appt.patientId && localStorage.getItem(`patient_${appt.patientId}_age`)) ||
          (appt.patient_details && appt.patient_details.age) ||
          "N/A"; // Fallback to "N/A" instead of "-"
          
        // Extract blood group
        const bloodGroup = 
          (appt.patient && appt.patient.bloodGroup) ||
          (appt.patient && appt.patient.bloodType) ||
          (appt.patient && appt.patient.blood_group) ||
          (appt.patient && appt.patient.blood_type) ||
          (appt.patient && appt.patient.patientDetails && appt.patient.patientDetails.bloodGroup) ||
          (appt.patient && appt.patient.details && appt.patient.details.bloodGroup) ||
          (appt.patient_details && appt.patient_details.bloodGroup) ||
          null;
          
        // Extract patient contact information
        const patientContact = 
          (appt.patient && appt.patient.contact) ||
          (appt.patient && appt.patient.phone) ||
          (appt.patient && appt.patient.phoneNumber) ||
          (appt.patient && appt.patient.contactNumber) ||
          (appt.patient && appt.patient.mobile) ||
          null;
          
        // Extract patient email
        const patientEmail = 
          (appt.patient && appt.patient.email) ||
          (appt.patient && appt.patient.emailAddress) ||
          null;
          
        // Extract patient gender
        const patientGender = 
          (appt.patient && appt.patient.gender) ||
          (appt.patient && appt.patient.sex) ||
          null;
          
        // Extract patient address
        const patientAddress = 
          (appt.patient && appt.patient.address) ||
          (appt.patient && appt.patient.addr) ||
          null;
        
        // Extract appointment date
        const apptDate = new Date(appt.appointmentDate || appt.appointment_date || appt.date);
        
        // Format the appointment for display
        const formattedAppointment = {
          id: appt.apId || appt.id || appt.appointmentId,
        patient: {
            id: patientId,
            name: patientName,
            age: patientAge,
            image: appt.patientImage || (appt.patient && appt.patient.image ? appt.patient.image : null),
            contact: patientContact,
            email: patientEmail,
            gender: patientGender,
            bloodGroup: bloodGroup,
            address: patientAddress
          },
          date: apptDate.toLocaleDateString(),
          time: appt.appointmentTime || appt.time || '00:00',
          type: appt.appointmentType || appt.type || 'Consultation',
          status: appt.status || 'Scheduled',
          notes: appt.description || appt.descript || appt.notes || '',
          // Store the original data for reference
          originalData: appt
        };
        
        // Log the processed appointment to help with debugging
        console.log('Processed appointment:', formattedAppointment);
        
        // Categorize based on date
        if (apptDate.toDateString() === todayStr) {
          processed.today.push(formattedAppointment);
        } else if (apptDate > today) {
          processed.upcoming.push(formattedAppointment);
        } else {
          processed.past.push(formattedAppointment);
        }
      } catch (err) {
        console.error('Error processing appointment:', appt, err);
      }
    });
    
    // Sort appointments by time
    processed.today.sort((a, b) => a.time.localeCompare(b.time));
    processed.upcoming.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    processed.past.sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));
    
    setFilteredAppointments(processed);
  };
  
  // Filter appointments based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If no search query, restore the original categorized appointments
      processAppointments(allAppointments);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = allAppointments.filter(appt => {
      // Get patient name from various possible structures
      const patientName = 
        (appt.patientName) || 
        (appt.patient ? appt.patient.name : '') || 
        '';
      
      // Check if patient name, type, or status contains the search query
      return (
        patientName.toLowerCase().includes(query) ||
        (appt.appointmentType || appt.type || '').toLowerCase().includes(query) ||
        (appt.status || '').toLowerCase().includes(query)
      );
    });
    
    // Reprocess the filtered appointments
    processAppointments(filtered);
  }, [searchQuery, allAppointments]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'checked in':
      case 'checkedin':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    let color = "";
    switch (status.toLowerCase()) {
      case 'scheduled':
        color = "bg-yellow-100 text-yellow-800";
        break;
      case 'checked in':
      case 'checkedin':
        color = "bg-blue-100 text-blue-800";
        break;
      case 'completed':
        color = "bg-green-100 text-green-800";
        break;
      case 'cancelled':
      case 'canceled':
        color = "bg-red-100 text-red-800";
        break;
      case 'pending':
        color = "bg-purple-100 text-purple-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {status.toUpperCase()}
      </div>
    );
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <ClockOutlineIcon className="h-5 w-5" />;
      case 'checked in':
      case 'checkedin':
        return <UserIcon className="h-5 w-5" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled':
      case 'canceled':
        return <XCircleIcon className="h-5 w-5" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };
  
  // Update appointment status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      await appointmentService.updateAppointmentStatus(id, newStatus);
      
      // Update the local state to reflect the status change
      const updatedAppointments = allAppointments.map(appt => {
        if ((appt.apId === id) || (appt.id === id)) {
          return { ...appt, status: newStatus };
        }
        return appt;
      });
      
      setAllAppointments(updatedAppointments);
      processAppointments(updatedAppointments);
      
      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating appointment status:', err);
      toast.error(`Failed to update status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to open details modal
  const openDetailsModal = (appointment) => {
    setShowDetailsModal(true);
    setSelectedAppointment(appointment);
    
    // Show loading state in modal
    toast.info('Fetching complete patient details...', {
      autoClose: 2000,
      position: 'bottom-right'
    });
    
    // Always fetch the freshest patient details when opening modal
    fetchPatientDetails(appointment);
  };

  // Function to directly test API endpoint
  const testPatientApi = async (patientId) => {
    try {
      toast.info(`Testing direct API call for patient ID: ${patientId}`);
      
      // Try multiple variations of the endpoint to see which one works
      const endpoints = [
        `${API_BASE_URL}/patients/${patientId}`,
        `${API_BASE_URL}/patient/${patientId}`,
        `${API_BASE_URL}/patients/get/${patientId}`,
        `${API_BASE_URL}/patient/details/${patientId}`
      ];
      
      console.log('Testing endpoints:', endpoints);
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint);
          console.log(`Endpoint ${endpoint} status:`, response.status);
          
          if (response.ok) {
            const data = await response.text();
            console.log(`Success with endpoint ${endpoint}:`, data);
            
            try {
              const jsonData = JSON.parse(data);
              console.log('Parsed JSON data:', jsonData);
              
              // If we got here, we found a working endpoint
              toast.success(`Found working endpoint: ${endpoint}`);
              return {
                endpoint,
                data: jsonData
              };
            } catch (jsonError) {
              console.error('Response is not valid JSON:', jsonError);
            }
          }
        } catch (endpointError) {
          console.error(`Error with endpoint ${endpoint}:`, endpointError);
        }
      }
      
      toast.error('All API endpoint variations failed');
      return null;
    } catch (error) {
      console.error('Error in API test function:', error);
      toast.error(`API test failed: ${error.message}`);
      return null;
    }
  };
  
  // Function to fetch additional patient details
  const fetchPatientDetails = async (appointment) => {
    try {
      // Set loading state
      setLoadingPatientDetails(true);
      
      // Extract patient ID - prioritize the originalData.pId first
      const patientId = 
        (appointment.originalData && appointment.originalData.pId) ||
        (appointment.originalData && appointment.originalData.patientId) ||
        appointment.patient.id || 
        appointment.pId || 
        appointment.patientId;
      
      console.log('Attempting to fetch patient details with ID:', patientId);
      console.log('Original appointment data:', appointment.originalData);
      
      if (!patientId) {
        console.log('No patient ID available to fetch details');
        toast.error('No patient ID found to fetch details');
        setLoadingPatientDetails(false);
        return;
      }
      
      // Use the test function to find a working endpoint
      const apiTestResult = await testPatientApi(patientId);
      
      if (apiTestResult && apiTestResult.data) {
        console.log('Successfully retrieved patient data via test function:', apiTestResult.data);
        
        // Update the selected appointment with the retrieved patient data
        setSelectedAppointment(prev => {
          const updatedPatient = {
            ...prev.patient,
            id: patientId,
            name: apiTestResult.data.name || apiTestResult.data.patientName || apiTestResult.data.firstName || prev.patient.name,
            age: apiTestResult.data.age || apiTestResult.data.patientAge || prev.patient.age,
            gender: apiTestResult.data.gender || apiTestResult.data.sex || prev.patient.gender,
            bloodGroup: apiTestResult.data.bloodGroup || apiTestResult.data.bloodType || prev.patient.bloodGroup,
            contact: apiTestResult.data.contact || apiTestResult.data.phone || apiTestResult.data.phoneNumber || prev.patient.contact,
            email: apiTestResult.data.email || apiTestResult.data.emailAddress || prev.patient.email,
            address: apiTestResult.data.address || apiTestResult.data.addr || prev.patient.address,
            weight: apiTestResult.data.weight || prev.patient.weight,
            height: apiTestResult.data.height || prev.patient.height,
            medicalHistory: apiTestResult.data.medicalHistory || apiTestResult.data.medical_history || prev.patient.medicalHistory,
            allergies: apiTestResult.data.allergies || prev.patient.allergies,
            emergencyContact: apiTestResult.data.emergencyContact || apiTestResult.data.emergency_contact || prev.patient.emergencyContact
          };
          
          console.log('Updated patient data:', updatedPatient);
          
          return {
            ...prev,
            patient: updatedPatient,
            originalData: {
              ...prev.originalData,
              patient: apiTestResult.data
            }
          };
        });
        
        toast.success('Patient details loaded successfully');
      } else {
        console.log('Failed to fetch patient data via test function, falling back to direct API call');
        
        try {
          // Make direct API call as a fallback
          const response = await fetch(`${API_BASE_URL}/patients/${patientId}`);
          
          // Log raw response for debugging
          const responseText = await response.text();
          console.log(`Raw API Response for patient ${patientId}:`, responseText);
          
          let patientData;
          try {
            // Try to parse the response as JSON
            patientData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Error parsing patient data response:', parseError);
            toast.error('Invalid response format from server');
            setLoadingPatientDetails(false);
            return;
          }
          
          console.log('Parsed patient data:', patientData);
          
          if (patientData) {
            // Update state with the fallback data
            setSelectedAppointment(prev => {
              const updatedPatient = {
                ...prev.patient,
                id: patientId,
                // Try multiple possible field names for each property
                name: 
                  patientData.name || 
                  patientData.patientName || 
                  patientData.firstName || 
                  (patientData.firstName && patientData.lastName ? `${patientData.firstName} ${patientData.lastName}` : null) || 
                  prev.patient.name,
                age: 
                  patientData.age || 
                  patientData.patientAge || 
                  prev.patient.age,
                gender: 
                  patientData.gender || 
                  patientData.sex || 
                  prev.patient.gender,
                bloodGroup: 
                  patientData.bloodGroup || 
                  patientData.bloodType || 
                  patientData.blood_group || 
                  prev.patient.bloodGroup,
                contact: 
                  patientData.contact || 
                  patientData.phone || 
                  patientData.phoneNumber || 
                  patientData.contactNumber || 
                  patientData.mobile || 
                  prev.patient.contact,
                email: 
                  patientData.email || 
                  patientData.emailAddress || 
                  prev.patient.email,
                address: 
                  patientData.address || 
                  patientData.addr || 
                  prev.patient.address,
                weight: 
                  patientData.weight ||
                  prev.patient.weight,
                height: 
                  patientData.height ||
                  prev.patient.height,
                medicalHistory: 
                  patientData.medicalHistory || 
                  patientData.medical_history ||
                  prev.patient.medicalHistory,
                allergies: 
                  patientData.allergies ||
                  prev.patient.allergies,
                emergencyContact: 
                  patientData.emergencyContact || 
                  patientData.emergency_contact ||
                  prev.patient.emergencyContact
              };
              
              console.log('Updated patient data from fallback:', updatedPatient);
              
              return {
                ...prev,
                patient: updatedPatient,
                originalData: {
                  ...prev.originalData,
                  patient: patientData
                }
              };
            });
            
            toast.success('Patient details loaded via fallback');
          } else {
            toast.warning('Patient data is empty or invalid');
          }
        } catch (error) {
          console.error('Error in fallback API call:', error);
          toast.error(`Failed to fetch patient data: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error in fetchPatientDetails:', error);
      toast.error(`Error fetching patient details: ${error.message}`);
    } finally {
      setLoadingPatientDetails(false);
    }
  };

  // Function to close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAppointment(null);
  };

  // Open prescription modal - simplified version
  const openPrescriptionModal = () => {
    setShowSimplePrescriptionForm(true);
  };
  
  // Close prescription modal - simplified version
  const closePrescriptionModal = () => {
    setShowSimplePrescriptionForm(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FunnelIcon className="h-5 w-5" />
            Filter
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => {
              const userData = JSON.parse(localStorage.getItem('user') || '{}');
              if (userData.id) {
                setLoading(true);
                appointmentService.getAppointmentsByDoctor(userData.id)
                  .then(response => {
                    if (response.data) {
                      console.log('Refreshed appointments:', response.data);
                      setAllAppointments(response.data);
                      processAppointments(response.data);
                    }
                  })
                  .catch(err => {
                    console.error('Error refreshing appointments:', err);
                    toast.error('Failed to refresh appointments');
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }
            }}
          >
            Refresh Appointments
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-4">
          {['today', 'upcoming', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
            className={`px-6 py-3 rounded-lg font-medium text-sm capitalize ${
                selectedTab === tab
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab} ({filteredAppointments[tab].length})
            </button>
          ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 bg-white rounded-lg shadow">
            <ExclamationCircleIcon className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              Retry
            </button>
          </div>
        ) : filteredAppointments[selectedTab].length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
            <CalendarDaysIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No {selectedTab} appointments found</p>
            <p className="mt-1">
              {selectedTab === 'today' 
                ? 'You have no appointments scheduled for today.' 
                : selectedTab === 'upcoming' 
                  ? 'You have no upcoming appointments scheduled.' 
                  : 'No past appointment records found.'}
                    </p>
                  </div>
        ) : (
          filteredAppointments[selectedTab].map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between p-6 gap-6 border border-gray-100 hover:shadow-2xl transition-shadow">
              {/* Patient Info */}
              <div className="flex items-center gap-5 flex-1">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-gray-900">{appointment.patient.name}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">ID: {appointment.patient.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    {appointment.patient.gender && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {appointment.patient.gender}
                      </span>
                    )}
                    {appointment.patient.bloodGroup && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Blood: {appointment.patient.bloodGroup}
                  </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                    {appointment.patient.contact && (
                      <span className="flex items-center gap-1"><svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{appointment.patient.contact}</span>
                    )}
                    {appointment.patient.email && (
                      <span className="flex items-center gap-1"><svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{appointment.patient.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="flex flex-col gap-2 items-start md:items-end">
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FunnelIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{appointment.type}</span>
                </div>
                <div className="mt-2">{getStatusBadge(appointment.status)}</div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-6">
                <button className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow" onClick={() => openDetailsModal(appointment)}>
                  View Details
                </button>
                {(selectedTab === 'today' || selectedTab === 'upcoming') && 
                  (appointment.status.toLowerCase() !== 'cancelled' && appointment.status.toLowerCase() !== 'completed') && (
                  <button 
                    onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow"
                  >
                    Cancel
                  </button>
                )}
                {selectedTab === 'today' && appointment.status.toLowerCase() === 'scheduled' && (
                  <button 
                    onClick={() => handleUpdateStatus(appointment.id, 'CHECKED IN')}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow"
                  >
                    Check In
                  </button>
                )}
                {selectedTab === 'today' && appointment.status.toLowerCase() !== 'completed' && (
                  <button 
                    onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow"
                  >
                    Complete
                </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination - Only show if we have more than 10 appointments */}
      {filteredAppointments[selectedTab].length > 10 && (
        <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </nav>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-30 flex items-center justify-center">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-12 animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-8 py-5 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-wide">Appointment Details</h2>
              <button onClick={closeDetailsModal} className="text-white hover:text-gray-200 transition-colors">
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Patient Info Card */}
              <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-semibold text-gray-900">{selectedAppointment.patient.name}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">ID: {selectedAppointment.patient.id}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAppointment.patient.gender && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {selectedAppointment.patient.gender}
                        </span>
                      )}
                      {selectedAppointment.patient.bloodGroup && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Blood: {selectedAppointment.patient.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm mt-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">Age:</span> {selectedAppointment.patient.age !== "N/A" ? selectedAppointment.patient.age : 'Not specified'}
                  </div>
                  {selectedAppointment.patient.contact && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {selectedAppointment.patient.contact}
                    </div>
                  )}
                  {selectedAppointment.patient.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {selectedAppointment.patient.email}
                    </div>
                  )}
                  {selectedAppointment.patient.address && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {selectedAppointment.patient.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Info Card */}
              <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-lg text-gray-900">Appointment Info</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Date:</span> {selectedAppointment.date}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Time:</span> {selectedAppointment.time}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Type:</span> {selectedAppointment.type}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-medium">Status:</span> {getStatusBadge(selectedAppointment.status)}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {selectedAppointment.notes && (
              <div className="bg-green-50 rounded-xl shadow p-6 mx-8 mt-4 flex items-start gap-3">
                <svg className="h-6 w-6 text-green-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Notes</h4>
                  <p className="italic text-gray-700">"{selectedAppointment.notes}"</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="bg-gray-100 px-8 py-5 rounded-b-2xl flex flex-col md:flex-row md:justify-end gap-3 mt-4">
              <button
                type="button"
                className="w-full md:w-auto inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none transition-colors duration-200"
                onClick={closeDetailsModal}
              >
                Close
              </button>
              {selectedAppointment && selectedAppointment.status.toLowerCase() === 'completed' && (
                <button
                  type="button"
                  className="w-full md:w-auto inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none transition-colors duration-200"
                  onClick={openPrescriptionModal}
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Create Prescription
                </button>
              )}
              {selectedAppointment && selectedAppointment.status.toLowerCase() !== 'cancelled' && 
                selectedAppointment.status.toLowerCase() !== 'completed' && (
                <button
                  type="button"
                  className="w-full md:w-auto inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none transition-colors duration-200"
                  onClick={() => {
                    handleUpdateStatus(selectedAppointment.id, 'CANCELLED');
                    closeDetailsModal();
                  }}
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Cancel Appointment
                </button>
              )}
              {selectedAppointment && selectedAppointment.status.toLowerCase() === 'scheduled' && (
                <button
                  type="button"
                  className="w-full md:w-auto inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none transition-colors duration-200"
                  onClick={() => {
                    handleUpdateStatus(selectedAppointment.id, 'COMPLETED');
                    closeDetailsModal();
                  }}
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Simple Prescription Form */}
      {showSimplePrescriptionForm && selectedAppointment && (
        <PrescriptionForm
          patient={selectedAppointment.patient}
          appointmentId={selectedAppointment.id}
          onClose={closePrescriptionModal}
        />
      )}

      {/* Old Prescription Modal - Commenting out to replace with new component */}
      {/*
      {showPrescriptionModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            ... existing prescription modal code ...
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default Appointments; 