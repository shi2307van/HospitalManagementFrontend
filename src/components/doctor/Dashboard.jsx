import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ClockIcon,
  CheckIcon,
  CalendarIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  UserIcon,
  UserGroupIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { appointmentService, prescriptionService, patientService } from '../../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentCounts, setAppointmentCounts] = useState({
    today: 0,
    upcoming: 0,
    past: 0,
    total: 0
  });
  const [doctorInfo, setDoctorInfo] = useState({
    name: '',
    specialty: '',
    patients: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  
  useEffect(() => {
    const fetchAppointmentCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get doctor ID from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('User data not found. Please log in again.');
        }
        
        const userData = JSON.parse(userStr);
        if (!userData.id) {
          throw new Error('Doctor ID not found. Please log in again.');
        }
        
        // Set basic doctor info
        setDoctorInfo({
          name: userData.name || 'Doctor',
          specialty: userData.specialty || 'Specialist',
          patients: Math.floor(Math.random() * 200) + 100 // Placeholder
        });
        
        // Fetch appointments for this doctor
        const response = await appointmentService.getAppointmentsByDoctor(userData.id);
        
        if (response.data) {
          const appointments = response.data;
          
          // Process and count appointments by category
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayStr = today.toDateString();
          
          const counts = {
            today: 0,
            upcoming: 0,
            past: 0,
            total: appointments.length
          };
          
          // Placeholder for recent appointments
          const recent = [];
          
          appointments.forEach(appt => {
            try {
              const apptDate = new Date(appt.appointmentDate || appt.appointment_date || appt.date);
              
              if (apptDate.toDateString() === todayStr) {
                counts.today++;
                if (recent.length < 3) {
                  recent.push({
                    id: appt.apId || appt.id,
                    patientName: appt.patientName || 'Patient',
                    patientAge: appt.patientAge || Math.floor(Math.random() * 70) + 18,
                    time: appt.appointmentTime || '09:00 AM',
                    status: appt.status || 'Scheduled',
                    date: apptDate.toLocaleDateString(),
                    reason: appt.descript || appt.description || 'General Consultation',
                    type: appt.appointmentType || 'Check-up'
                  });
                }
              } else if (apptDate > today) {
                counts.upcoming++;
                if (recent.length < 3 && apptDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) {
                  recent.push({
                    id: appt.apId || appt.id,
                    patientName: appt.patientName || 'Patient',
                    patientAge: appt.patientAge || Math.floor(Math.random() * 70) + 18,
                    time: appt.appointmentTime || '09:00 AM',
                    status: appt.status || 'Scheduled',
                    date: apptDate.toLocaleDateString(),
                    reason: appt.descript || appt.description || 'General Consultation',
                    type: appt.appointmentType || 'Check-up'
                  });
                }
              } else {
                counts.past++;
              }
            } catch (err) {
              console.error('Error processing appointment date:', err);
            }
          });
          
          setAppointmentCounts(counts);
          setRecentAppointments(recent);
        }
      } catch (err) {
        console.error('Error fetching appointment data:', err);
        setError(err.message || 'Failed to load appointment data');
        toast.error(`Error: ${err.message || 'Failed to load appointment data'}`);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchPrescriptions = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        if (!userData.id) return;
        const response = await prescriptionService.getPrescriptionsByDoctor(userData.id);
        if (response.data) {
          setRecentPrescriptions(response.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      }
    };
    
    const fetchPatients = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        if (!userData.id) return;
        // Fetch recent patients for this doctor
        const response = await patientService.getDoctorPatients(userData.id);
        if (response.data) {
          // Optionally sort or limit to most recent 3
          setRecentPatients(response.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };
    
    fetchAppointmentCounts();
    fetchPrescriptions();
    fetchPatients();
  }, []);

  const handleCardClick = (tabName) => {
    navigate('/doctor/appointments', { state: { selectedTab: tabName } });
  };

  const appointmentCards = [
    {
      id: 'today',
      title: "Today's Appointments",
      count: appointmentCounts.today,
      icon: <ClockIcon className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50 border-blue-100',
      textColor: 'text-blue-900'
    },
    {
      id: 'upcoming',
      title: 'Upcoming Appointments',
      count: appointmentCounts.upcoming,
      icon: <CalendarIcon className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50 border-green-100',
      textColor: 'text-green-900'
    },
    {
      id: 'past',
      title: 'Past Appointments',
      count: appointmentCounts.past,
      icon: <CheckIcon className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50 border-purple-100',
      textColor: 'text-purple-900'
    }
  ];

  const quickActions = [
    {
      title: 'New Appointment',
      icon: <PlusCircleIcon className="h-6 w-6 text-blue-500" />,
      path: '/doctor/appointments/new',
      description: 'Schedule a new appointment'
    },
    {
      title: 'Write Prescription',
      icon: <DocumentTextIcon className="h-6 w-6 text-green-500" />,
      path: '/doctor/prescriptions/new',
      description: 'Create a new prescription'
    },
    {
      title: 'Patient Records',
      icon: <UserGroupIcon className="h-6 w-6 text-purple-500" />,
      path: '/doctor/patients',
      description: 'View patient records'
    }
  ];

  const recentNotifications = [
    {
      id: 1,
      message: 'New lab results available for Mary Johnson',
      time: '30 minutes ago',
      icon: <BellIcon className="h-5 w-5 text-blue-500" />
    },
    {
      id: 2,
      message: 'Appointment rescheduled by James Wilson to May 2',
      time: '2 hours ago',
      icon: <CalendarIcon className="h-5 w-5 text-orange-500" />
    },
    {
      id: 3,
      message: 'New message from Dr. Williams about patient referral',
      time: 'Yesterday',
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'checked in':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-md mb-8 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, Dr. {doctorInfo.name.split(' ')[0]}</h1>
            <p className="mt-1 text-primary-100">{doctorInfo.specialty} • {doctorInfo.patients} Patients</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="mt-1 text-white font-medium">Have a great day!</p>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-lg text-red-500 border border-red-200 mb-6">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Appointment Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {appointmentCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`cursor-pointer rounded-lg border p-6 transition-all duration-200 ${card.color} hover:shadow-md`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                    <p className={`text-5xl font-bold ${card.textColor}`}>{card.count}</p>
                  </div>
                  <div className="p-2">
                    {card.icon}
                  </div>
                </div>
                <div className="mt-6 flex items-center text-gray-700">
                  <span className="text-sm">View details</span>
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Actions and Patient Details (2 columns) */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-gray-100 mb-2">
                      {action.icon}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                    <p className="text-xs text-gray-500 text-center mt-1">{action.description}</p>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Recent Patients */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Patients</h2>
                <Link to="/doctor/patients" className="text-sm text-teal-600 hover:text-teal-700">View All</Link>
              </div>
              <div className="space-y-4">
                {recentPatients.length === 0 ? (
                  <div className="text-gray-500">No recent patients.</div>
                ) : (
                  recentPatients.map(patient => (
                    <div key={patient.id} className="flex p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">{patient.name}, {patient.age}</p>
                          <span className="text-xs text-gray-500">Last visit: {patient.lastVisit || patient.last_visit || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{patient.condition || patient.diagnosis || ''}</p>
                        <div className="flex items-center mt-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">Next: {patient.nextAppointment || patient.next_appointment || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Prescriptions */}
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Recent Prescriptions</h2>
              <Link to="/doctor/prescriptions" className="text-sm text-teal-600 hover:text-teal-700">View All</Link>
            </div>
            <div className="space-y-4">
              {recentPrescriptions.length === 0 ? (
                <div className="text-gray-500">No recent prescriptions.</div>
              ) : (
                recentPrescriptions.map(prescription => (
                  <div key={prescription.id} className="flex flex-col md:flex-row border-l-4 border-green-400 bg-green-50/50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center mr-4">
                      <div className="bg-green-100 p-2 rounded-full mb-2">
                        <DocumentTextIcon className="h-8 w-8 text-green-600" />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">#{prescription.id}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-2">
                        <div>
                          <span className="font-semibold text-gray-900 text-base">
                            {prescription.patient?.name}
                          </span>
                          {prescription.patient?.age && (
                            <span className="ml-2 text-xs text-gray-500">({prescription.patient?.age} yrs)</span>
                          )}
                          <span className="ml-2 text-xs text-gray-400">Issued: {prescription.dateIssued ? new Date(prescription.dateIssued).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            {prescription.diagnosis || prescription.description || 'No diagnosis'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div className="bg-white border border-green-100 rounded p-2">
                          <span className="block text-xs text-gray-500">Medicine</span>
                          <span className="block text-sm text-green-700 font-medium">{prescription.medicine || '-'}</span>
                        </div>
                        <div className="bg-white border border-green-100 rounded p-2">
                          <span className="block text-xs text-gray-500">Advice</span>
                          <span className="block text-sm text-blue-700 font-medium">{prescription.advice || '-'}</span>
                        </div>
                        <div className="bg-white border border-green-100 rounded p-2">
                          <span className="block text-xs text-gray-500">Remark</span>
                          <span className="block text-sm text-gray-700">{prescription.remark || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Appointment Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Appointment Summary</h2>
            <div className="grid grid-cols-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-teal-600">{appointmentCounts.total}</p>
                <p className="mt-2 text-gray-600">Total Appointments</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600">{appointmentCounts.today}</p>
                <p className="mt-2 text-gray-600">Today</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-green-600">{appointmentCounts.upcoming}</p>
                <p className="mt-2 text-gray-600">Upcoming</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-purple-600">{appointmentCounts.past}</p>
                <p className="mt-2 text-gray-600">Past</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 