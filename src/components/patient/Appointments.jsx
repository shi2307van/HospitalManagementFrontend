import React, { useState, useEffect } from 'react';
import { UserIcon, ExclamationCircleIcon, ClockIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { appointmentService, doctorService } from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // Changed from 'upcoming' to 'all'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'doctor', 'status'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'PENDING', 'CONFIRMED', 'CANCELLED'
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [dataPulse, setDataPulse] = useState(false); // For pulse animation

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Add keyboard shortcut for refresh (F5 or Ctrl+R)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // F5 key or Ctrl+R
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault(); // Prevent browser default refresh
        fetchAppointments();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    
    try {
      // Get the patient ID from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('You must be logged in to view appointments');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const user = JSON.parse(userData);
      const patientId = user.id || user.P_ID;
      
      if (!patientId) {
        setError('Unable to determine patient ID');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Fetching appointments for patient ID:', patientId);
      
      // Make API call to fetch appointments
      const response = await appointmentService.getAppointmentsByPatient(patientId);
      console.log('Appointments API response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        // First debug the raw data structure
        console.log('Raw appointment data structure:', response.data[0]);
        
        // Map the database fields to our component's expected structure
        const appointmentsWithDetails = await Promise.all(
          response.data.map(async (appointment) => {
            try {
              // Extract doctor ID - handle different possible field names
              const doctorId = appointment.drId || appointment.DR_ID || appointment.doctorId || appointment.dr_id;
              
              // Make sure we properly map apId to id
              const appointmentId = appointment.apId || appointment.id || appointment.A_ID || appointment.appointmentId;
              
              if (!doctorId) {
                console.warn('Appointment missing doctor ID:', appointment);
                // Create a partial appointment record even without doctor details
                return {
                  id: appointmentId, // Use apId first if available
                  P_ID: patientId,
                  DR_ID: 'Unknown',
                  appointment_date: appointment.appointmentDate || appointment.appointment_date || appointment.date,
                  appointment_time: appointment.appointmentTime || appointment.appointment_time || appointment.time,
                  Descript: appointment.descript || appointment.Descript || appointment.description || '',
                  status: appointment.status || 'PENDING',
                  doctor: {
                    name: 'Unknown Doctor',
                    specialty: 'Specialty not available',
                    avatar: null,
                    fee: 'N/A'
                  }
                };
              }
              
              // Try to get doctor details
              const doctorResponse = await doctorService.getDoctorById(doctorId);
              
              // Handle different field structures from the database
              const doctor = doctorResponse.data;
              return {
                id: appointmentId, // Use apId first if available
                P_ID: patientId,
                DR_ID: doctorId,
                appointment_date: appointment.appointmentDate || appointment.appointment_date || appointment.date,
                appointment_time: appointment.appointmentTime || appointment.appointment_time || appointment.time, 
                Descript: appointment.descript || appointment.Descript || appointment.description || '',
                status: (appointment.status || 'PENDING').toUpperCase(), // Ensure consistent status format
                doctor: {
                  name: doctor.Name || doctor.name || doctor.drName || `Doctor ${doctorId}`,
                  specialty: doctor.Specialization || doctor.specialization || doctor.specialty || 'Specialist',
                  avatar: doctor.image ? `data:image/jpeg;base64,${doctor.image}` : null,
                  fee: doctor.Fees || doctor.fees || doctor.fee || 'N/A'
                }
              };
            } catch (error) {
              console.error(`Error fetching doctor details for appointment ${appointment.apId || appointment.id || 'unknown'}:`, error);
              // Return appointment with minimal doctor info
              return {
                id: appointment.apId || appointment.id || appointment.A_ID || appointment.appointmentId,
                P_ID: patientId,
                DR_ID: appointment.drId || appointment.DR_ID || appointment.doctorId || appointment.dr_id || 'Unknown',
                appointment_date: appointment.appointmentDate || appointment.appointment_date || appointment.date,
                appointment_time: appointment.appointmentTime || appointment.appointment_time || appointment.time,
                Descript: appointment.descript || appointment.Descript || appointment.description || '',
                status: (appointment.status || 'PENDING').toUpperCase(),
                doctor: {
                  name: `Doctor ${appointment.drId || appointment.DR_ID || appointment.doctorId || 'Unknown'}`,
                  specialty: 'Specialist',
                  avatar: null,
                  fee: 'N/A'
                }
              };
            }
          })
        );
        
        // Log the processed appointments data
        console.log('Processed appointments data:', appointmentsWithDetails);
        
        // Update state with the processed data
        setAppointments(appointmentsWithDetails);
        setLastRefreshed(new Date());
        
        // Trigger pulse animation
        setDataPulse(true);
        setTimeout(() => setDataPulse(false), 1000); // Reset after animation completes
      } else {
        console.warn('Invalid appointments data format received:', response);
        setError('Received invalid data format from server');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      
      if (error.response) {
        console.error('Server error response:', error.response.data);
        setError(`Failed to load appointments: ${error.response.data.message || error.response.statusText || 'Server error'}`);
      } else if (error.message === 'Network Error') {
        setIsDemoMode(true);
        setAppointments(generateMockAppointments());
        toast.info('Using demo mode - showing sample appointment data');
      } else {
        setError(`Failed to load appointments: ${error.message || 'Unknown error'}`);
        toast.error(`Failed to load appointments: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockAppointments = () => {
    return [
      {
        id: 1,
        P_ID: 1,
        DR_ID: 401,
        appointment_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
        appointment_time: '09:30',
        Descript: "Recurring lower back pain for the past 2 weeks",
        status: 'CONFIRMED',
        doctor: {
          name: "Dr. James Wilson",
          specialty: "Orthopedics",
          avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          fee: "$160"
        }
      },
      {
        id: 2,
        P_ID: 1,
        DR_ID: 101,
        appointment_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
        appointment_time: '11:00',
        Descript: "Annual heart checkup and ECG",
        status: 'PENDING',
        doctor: {
          name: "Dr. Sarah Johnson",
          specialty: "Cardiology",
          avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          fee: "$150"
        }
      },
      {
        id: 3,
        P_ID: 1,
        DR_ID: 201,
        appointment_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], // 5 days ago
        appointment_time: '14:30',
        Descript: "Skin rash and itching",
        status: 'COMPLETED',
        doctor: {
          name: "Dr. Sarah Johnson",
          specialty: "Dermatology",
          avatar: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          fee: "$130"
        }
      },
      {
        id: 4,
        P_ID: 1,
        DR_ID: 301,
        appointment_date: new Date(Date.now() - 86400000 * 15).toISOString().split('T')[0], // 15 days ago
        appointment_time: '10:00',
        Descript: "Frequent headaches and dizziness",
        status: 'CANCELLED',
        doctor: {
          name: "Dr. Robert Williams",
          specialty: "Neurology",
          avatar: null,
          fee: "$200"
        }
      }
    ];
  };

  const handleCancelAppointment = async (appointmentId) => {
    // Convert undefined or null to empty string for logging
    const idToUse = appointmentId || 'unknown';
    setCancelingId(idToUse);
    
    try {
      console.log('Attempting to cancel appointment with ID:', idToUse);
      console.log('ID type:', typeof idToUse);
      
      // Skip API call if we have no ID
      if (!idToUse || idToUse === 'unknown') {
        throw new Error('Cannot proceed without appointment ID');
      }
      
      // Use a direct API call to the server
      const response = await fetch(`http://localhost:8080/api/appointments/${idToUse}/status?status=CANCELLED`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      console.log('Cancel response:', response);
      
      // Update local state
      setAppointments(appointments.map(app => 
        app.id === idToUse ? { ...app, status: 'CANCELLED' } : app
      ));
      
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      
      // Try to provide a better error message
      toast.error(`Couldn't cancel appointment: ${error.message}`);
      
      // In demo mode, update UI anyway
      if (isDemoMode) {
        setAppointments(appointments.map(app => 
          app.id === idToUse ? { ...app, status: 'CANCELLED' } : app
        ));
        toast.info('Demo mode: appointment marked as cancelled locally');
      }
    } finally {
      setCancelingId(null);
    }
  };

  const getSortedAndFilteredAppointments = () => {
    let filtered = [...appointments];
    
    // Filter by tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(app => isUpcoming(app.appointment_date, app.appointment_time));
    } else if (activeTab === 'past') {
      filtered = filtered.filter(app => !isUpcoming(app.appointment_date, app.appointment_time));
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }
    
    // Sort appointments
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        // Sort by date and time
        const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
        const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
        return dateA - dateB;
      } else if (sortBy === 'doctor') {
        // Sort by doctor name
        return a.doctor.name.localeCompare(b.doctor.name);
      } else if (sortBy === 'status') {
        // Sort by status
        return a.status.localeCompare(b.status);
      }
      return 0;
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />;
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 text-yellow-600 mr-1" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4 text-red-600 mr-1" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-1" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    // Convert to 12-hour format
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (e) {
      return timeString;
    }
  };

  const isUpcoming = (dateString, timeString) => {
    if (!dateString || !timeString) return false;
    const appointmentDate = new Date(`${dateString}T${timeString}`);
    return appointmentDate > new Date();
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const appointmentDate = new Date(dateString);
    return appointmentDate.getDate() === today.getDate() &&
           appointmentDate.getMonth() === today.getMonth() &&
           appointmentDate.getFullYear() === today.getFullYear();
  };

  const formatLastRefreshed = () => {
    const now = new Date();
    const diffMs = now - lastRefreshed;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHrs < 24) {
      return `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return lastRefreshed.toLocaleString();
    }
  };

  const getAppointmentTypeBadge = (appointment) => {
    if (isToday(appointment.appointment_date)) {
      return "Today";
    } else if (isUpcoming(appointment.appointment_date, appointment.appointment_time)) {
      return "Upcoming";
    } else if (appointment.status === 'COMPLETED') {
      return "Completed";
    } else if (appointment.status === 'CANCELLED') {
      return "Cancelled";
    } else {
      return "Past";
    }
  };

  const getAppointmentTypeBadgeClass = (appointment) => {
    const type = getAppointmentTypeBadge(appointment);
    switch (type) {
      case 'Today':
        return 'bg-blue-100 text-blue-800';
      case 'Upcoming':
        return 'bg-green-50 text-green-700';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-500';
      case 'Past':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderEmptyState = () => {
    let message = "You have no appointments.";
    let icon = <ExclamationCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />;
    
    if (activeTab === 'upcoming') {
      message = "You have no upcoming appointments scheduled.";
    } else if (activeTab === 'past') {
      message = "You have no past appointment records.";
    }

  return (
      <div className="text-center py-12 bg-white rounded-lg">
        {icon}
        <p className="text-gray-500 text-lg mb-4">{message}</p>
          <Link 
            to="/patient/book-appointment"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Book New Appointment
          </Link>
        </div>
    );
  };

  // Add a more interactive refresh function with animations
  const handleRefresh = () => {
    // If already refreshing, don't do anything
    if (refreshing) return;
    
    // Fetch the appointments
    fetchAppointments();
    
    // Create more "alive" feeling by scrolling to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <div className="flex space-x-3">
              <Link 
                to="/patient/book-appointment"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Book New Appointment
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 text-lg">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              onClick={fetchAppointments}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 ${
                    activeTab === 'all'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Appointments
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 ${
                    activeTab === 'upcoming'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 ${
                    activeTab === 'past'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Past
                </button>
              </nav>
            </div>

            {/* Filters and sorting */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="flex space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="doctor">Sort by Doctor</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
              
                <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="relative flex items-center bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-70 group"
                title="Refresh appointments (F5 or Ctrl+R)"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-700 mr-2"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                    <span>Refresh</span>
                    <span className="ml-1 text-xs text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">(F5)</span>
                    {appointments.length > 0 && (
                      <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                        {appointments.length}
                      </span>
                    )}
                  </>
                )}
                <div className="absolute -bottom-5 left-0 text-xs text-gray-500 whitespace-nowrap">
                  Last updated: {formatLastRefreshed()}
                </div>
                </button>
            </div>

            {/* Appointment List */}
            {getSortedAndFilteredAppointments().length === 0 ? (
              renderEmptyState()
            ) : refreshing ? (
              // Show placeholder shimmer loading effect during refresh
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={`placeholder-${i}`} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
                    <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="col-span-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                          <div className="flex items-center mb-3">
                            <div className="h-14 w-14 bg-gray-200 rounded-full mr-3"></div>
                            <div>
                              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                          <div className="h-24 bg-gray-200 rounded w-full mb-4"></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`space-y-6 ${dataPulse ? 'animate-pulse bg-blue-50 p-4 rounded-lg transition-all duration-500' : ''}`}>
              {getSortedAndFilteredAppointments().map((appointment) => (
                <div 
                    key={appointment.id} 
                    className={`bg-white border ${
                      isUpcoming(appointment.appointment_date, appointment.appointment_time) && 
                      appointment.status !== 'CANCELLED' 
                        ? 'border-primary-200' 
                        : 'border-gray-200'
                    } rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {/* Appointment Header */}
                    <div className={`px-6 py-4 border-b ${
                      isToday(appointment.appointment_date)
                        ? 'bg-blue-50 border-blue-100' 
                        : isUpcoming(appointment.appointment_date, appointment.appointment_time) && 
                          appointment.status !== 'CANCELLED' 
                          ? 'bg-primary-50 border-primary-100' 
                          : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          {/* Date circle */}
                          <div className="hidden sm:flex h-14 w-14 rounded-full bg-white border border-gray-200 shadow-sm flex-shrink-0 items-center justify-center mr-3">
                            <div className="text-center">
                              <div className="text-xs uppercase text-gray-500 font-semibold">
                                {new Date(appointment.appointment_date).toLocaleString('default', { month: 'short' })}
                              </div>
                              <div className="text-lg font-bold text-gray-800">
                                {new Date(appointment.appointment_date).getDate()}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Appointment with {appointment.doctor.name}
                      </h2>
                            <div className="flex items-center mt-1 text-gray-500 text-sm">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {formatDate(appointment.appointment_date)}
                              <span className="mx-2">•</span>
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {formatTime(appointment.appointment_time)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                          {appointment.status}
                        </span>
                          
                          {/* Add appointment type badge */}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAppointmentTypeBadgeClass(appointment)}`}>
                            {getAppointmentTypeBadge(appointment)}
                        </span>
                        
                        {/* Show cancel button only for upcoming and non-cancelled appointments */}
                        {isUpcoming(appointment.appointment_date, appointment.appointment_time) && 
                         appointment.status !== 'CANCELLED' && 
                         appointment.status !== 'COMPLETED' && (
                          <button
                              onClick={() => {
                                // Debug logging
                                console.log('Cancelling appointment:', appointment);
                                console.log('All appointment properties:');
                                for (const key in appointment) {
                                  console.log(`${key}:`, appointment[key]);
                                }
                                // Try to get a valid ID - prioritize the mapped ID from the API response
                                const appointmentId =  appointment.apId;
                                                   
                                console.log('Using ID:', appointmentId);
                                
                                if (appointmentId) {
                                  handleCancelAppointment(appointmentId);
                                } else {
                                  toast.error('Could not find a valid appointment ID');
                                }
                              }}
                            disabled={cancelingId === appointment.id}
                              className={`inline-flex items-center px-3 py-1 border ${
                                cancelingId === appointment.id 
                                  ? 'border-gray-300 bg-gray-100 text-gray-500'
                                  : 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                              } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors`}
                            >
                              {cancelingId === appointment.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancel
                                </>
                              )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                    {/* Appointment Body */}
                  <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Doctor Information */}
                        <div className="col-span-1">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Doctor Information</h3>
                        <div className="flex items-center mb-3">
                          {appointment.doctor.avatar ? (
                            <img
                              src={appointment.doctor.avatar}
                              alt={appointment.doctor.name}
                                className="h-14 w-14 rounded-full object-cover mr-3 border-2 border-white shadow-sm"
                            />
                          ) : (
                              <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center mr-3 border-2 border-white shadow-sm">
                                <UserIcon className="h-7 w-7 text-primary-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{appointment.doctor.name}</p>
                            <p className="text-sm text-primary-600">{appointment.doctor.specialty}</p>
                              {appointment.doctor.fee && (
                                <p className="text-sm text-gray-500">Fee: {appointment.doctor.fee}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Appointment Details */}
                        <div className="col-span-2">
                          <h3 className="text-sm font-medium text-gray-500 mb-3">Appointment Details</h3>
                          
                          {/* Summary */}
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" />
                                <div>
                                  <span className="block text-gray-500">Date</span>
                                  <span className="font-medium">{formatDate(appointment.appointment_date)}</span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <ClockIcon className="h-5 w-5 mr-2 text-primary-500" />
                                <div>
                                  <span className="block text-gray-500">Time</span>
                                  <span className="font-medium">{formatTime(appointment.appointment_time)}</span>
                                </div>
                              </div>
                            </div>
                      </div>
                      
                      {/* Reason for Visit */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Reason for Visit:</h4
                            >
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {appointment.Descript || appointment.description || "No description provided"}
                        </p>
                          </div>
                          
                          {/* Additional details like appointment type could go here */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Appointment ID:</span> {appointment.id ? `#${appointment.id}` : 'Not available'}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span> Main Hospital, Floor 2
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/*Add a manual cancel button at the end of appointment listings*/}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Having trouble cancelling appointments?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If the Cancel button doesn't work, you can cancel your appointment by contacting us directly:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="tel:+1234567890" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call: (123) 456-7890
                </a>
                <a 
                  href="mailto:cancel@hospital.com" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email: cancel@hospital.com
                </a>
                <button 
                  onClick={() => {
                    // Show a toast with instructions
                    toast.info("Manual cancellation: Please include your appointment number and full name when contacting us.");
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-primary-300 shadow-sm text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cancellation Instructions
                </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments; 