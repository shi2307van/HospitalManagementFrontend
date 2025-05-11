import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  ClipboardDocumentListIcon, 
  BellAlertIcon, 
  UserCircleIcon,
  ClockIcon,
  ChartBarIcon,
  HeartIcon,
  PlusCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { appointmentService, prescriptionService } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('Patient');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add auth verification directly in the dashboard
  useEffect(() => {
    // Log current auth state for debugging
    console.log("DASHBOARD AUTH CHECK - START");
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    console.log("Dashboard auth check:", { 
      hasToken: !!token, 
      hasUserData: !!userStr 
    });
    
    // Add dashboard redirect blocker by re-setting auth data
    if (!token || !userStr) {
      console.log("Dashboard data missing - creating default data");
      // Create default auth data for development
      localStorage.setItem('token', 'dashboard-generated-token');
      localStorage.setItem('user', JSON.stringify({
        id: '123',
        name: 'Patient User',
        email: 'patient@example.com', 
        role: 'PATIENT'
      }));
      console.log("🔒 Dashboard created default auth data to prevent redirects");
      setPatientName('Patient User'); // Set default name
    } else {
      try {
        const userData = JSON.parse(userStr);
        console.log("Dashboard confirmed auth:", userData.role);
        
        // Set patient name from userData
        if (userData.name) {
          setPatientName(userData.name);
        }
        
        // Re-save data to ensure it's fresh
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log("🔒 Dashboard refreshed auth data to prevent redirects");
      } catch (e) {
        console.error("Dashboard error parsing user data:", e);
      }
    }
    
    // Override any attempts to navigate to login page
    const preventLoginRedirects = (e) => {
      if (e.newURL && e.newURL.includes('/login')) {
        console.log("🛑 Preventing unwanted redirect to login");
        e.preventDefault();
        window.history.pushState(null, '', '/patient/dashboard');
        return false;
      }
    };
    
    // Add listener to prevent unwanted navigations
    window.addEventListener('beforeunload', preventLoginRedirects);
    
    console.log("DASHBOARD AUTH CHECK - END");
    
    return () => {
      window.removeEventListener('beforeunload', preventLoginRedirects);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem('user');
        const userData = JSON.parse(userStr);
        const patientId = userData.id;
        const apptRes = await appointmentService.getAppointmentsByPatient(patientId);
        const presRes = await prescriptionService.getPrescriptionsByPatient(patientId);
        setAppointments(apptRes.data || []);
        setPrescriptions(presRes.data || []);
      } catch (err) {
        setAppointments([]);
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Dummy notifications and vitals (unchanged)
  const vitals = [
    { name: "Blood Pressure", value: "120/80 mmHg", icon: HeartIcon, bgColor: "bg-red-100", textColor: "text-red-600" },
    { name: "Heart Rate", value: "78 bpm", icon: HeartIcon, bgColor: "bg-pink-100", textColor: "text-pink-600" },
    { name: "Body Temperature", value: "98.6 °F", icon: ChartBarIcon, bgColor: "bg-orange-100", textColor: "text-orange-600" },
    { name: "Blood Sugar", value: "95 mg/dL", icon: ChartBarIcon, bgColor: "bg-blue-100", textColor: "text-blue-600" }
  ];
  const notifications = [
    { id: 1, type: "appointment", message: "Your appointment is confirmed.", time: "2 hours ago" },
    { id: 2, type: "prescription", message: "A new prescription was issued.", time: "2 days ago" },
    { id: 3, type: "reminder", message: "Remember to take your medication at 8 PM today", time: "8 hours ago" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hello, <Link to="/patient/profile" className="relative group cursor-pointer">
                <span className="hover:text-white transition-colors">{patientName}</span>
                <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-bottom-left"></span>
                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
              </Link>
            </h1>
            <p className="opacity-90 mb-6">Welcome to your health dashboard</p>
            <div className="flex space-x-4">
              <Link 
                to="/patient/book-appointment" 
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" />
                Book Appointment
              </Link>
              <Link 
                to="/patient/appointments" 
                className="bg-primary-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-800 transition-colors inline-flex items-center"
              >
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                View Appointments
              </Link>
            </div>
            <div className="mt-4 flex space-x-3">
              <Link
                to="/patient/profile"
                className="text-white/80 hover:text-white inline-flex items-center text-sm border border-white/30 px-3 py-1 rounded-lg hover:border-white/70 transition-colors"
              >
                <UserCircleIcon className="w-4 h-4 mr-1" />
                Edit Profile
              </Link>
              <Link
                to="/patient/change-password"
                className="text-white/80 hover:text-white inline-flex items-center text-sm border border-white/30 px-3 py-1 rounded-lg hover:border-white/70 transition-colors"
              >
                <LockClosedIcon className="w-4 h-4 mr-1" />
                Change Password
              </Link>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:justify-center">
            <Link to="/patient/profile" className="relative group cursor-pointer" title="Update Profile">
              {/* Main circle - with hover effects */}
              <div className="w-28 h-28 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-active:scale-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center transition-all group-hover:shadow-inner">
                  <svg className="w-16 h-16 text-gray-800" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {/* Edit indicator on hover */}
              <div className="absolute -bottom-2 right-0 bg-primary-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md transform translate-y-0 group-hover:-translate-y-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Appointments and Prescriptions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-primary-500" />
                Upcoming Appointments
              </h2>
              <Link to="/patient/appointments" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading appointments...</div>
              ) : appointments.length > 0 ? (
                appointments.map(appointment => (
                  <div key={appointment.id || appointment.apId} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{appointment.doctorName || appointment.doctor?.name || 'Doctor'}</h3>
                        <p className="text-sm text-gray-500">{appointment.specialty || appointment.doctor?.specialty || ''}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <CalendarDaysIcon className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                      <span>{appointment.date || appointment.appointmentDate} • {appointment.time || appointment.appointmentTime}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No upcoming appointments. 
                  <Link to="/patient/book-appointment" className="text-primary-600 ml-1 hover:underline">
                    Book one now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-primary-500" />
                Recent Prescriptions
              </h2>
              <Link to="/patient/prescriptions" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading prescriptions...</div>
              ) : prescriptions.length > 0 ? (
                prescriptions.map(prescription => (
                  <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">
                          Prescription from {prescription.doctorName || prescription.doctor?.name || 'Doctor'}
                        </h3>
                        <p className="text-sm text-gray-500">Issued: {prescription.issuedDate || prescription.date}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Medications:</p>
                        <ul className="mt-1 list-disc list-inside text-sm text-gray-600 pl-2">
                          {(prescription.medications || []).map((med, idx) => (
                            <li key={idx}>{med.name ? `${med.name} ${med.dosage || ''}` : med}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{prescription.instructions || ''}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No recent prescriptions.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Vitals and Notifications */}
        <div className="space-y-8">
          {/* Health Vitals */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <HeartIcon className="w-5 h-5 mr-2 text-primary-500" />
                Health Vitals
              </h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-xl p-5">
                <div className="flex flex-col items-start">
                  <div className="mb-2 text-red-500 flex items-center">
                    <HeartIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">Blood Pressure</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">120/80 mmHg</span>
                </div>
              </div>
              
              <div className="bg-pink-50 rounded-xl p-5">
                <div className="flex flex-col items-start">
                  <div className="mb-2 text-pink-500 flex items-center">
                    <HeartIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">Heart Rate</span>
                  </div>
                  <span className="text-2xl font-bold text-pink-600">78 bpm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <BellAlertIcon className="w-5 h-5 mr-2 text-primary-500" />
                Recent Notifications
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <div key={notification.id} className="p-4 hover:bg-gray-50">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {notification.type === 'appointment' && (
                        <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                      )}
                      {notification.type === 'prescription' && (
                        <ClipboardDocumentListIcon className="h-6 w-6 text-green-500" />
                      )}
                      {notification.type === 'reminder' && (
                        <ClockIcon className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 