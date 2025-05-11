import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  BellAlertIcon,
  ClockIcon,
  ServerStackIcon,
  CircleStackIcon,
  CloudIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  HomeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { doctorService, patientService, appointmentService } from '../../services/api';
import { format, isToday, isYesterday } from 'date-fns';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { name: 'Total Doctors', value: '...', icon: UserGroupIcon, color: 'blue' },
    { name: 'Total Patients', value: '...', icon: UserGroupIcon, color: 'green' },
    { name: 'Appointments', value: '...', icon: CalendarIcon, color: 'purple' },
    { name: 'Revenue', value: 'N/A', icon: CurrencyDollarIcon, color: 'yellow' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
          doctorService.getAllDoctors(),
          patientService.getAllPatients(),
          appointmentService.getAllAppointments()
        ]);
        setStats([
          { name: 'Total Doctors', value: doctorsRes.data.length, icon: UserGroupIcon, color: 'blue' },
          { name: 'Total Patients', value: patientsRes.data.length, icon: UserGroupIcon, color: 'green' },
          { name: 'Appointments', value: appointmentsRes.data.length, icon: CalendarIcon, color: 'purple' },
          { name: 'Revenue', value: 'N/A', icon: CurrencyDollarIcon, color: 'yellow' }
        ]);
      } catch (err) {
        setError('Failed to fetch stats');
        setStats([
          { name: 'Total Doctors', value: 'Error', icon: UserGroupIcon, color: 'blue' },
          { name: 'Total Patients', value: 'Error', icon: UserGroupIcon, color: 'green' },
          { name: 'Appointments', value: 'Error', icon: CalendarIcon, color: 'purple' },
          { name: 'Revenue', value: 'N/A', icon: CurrencyDollarIcon, color: 'yellow' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // Fetch recent doctors and patients
    const fetchRecent = async () => {
      try {
        const [doctorsRes, patientsRes] = await Promise.all([
          doctorService.getAllDoctors(),
          patientService.getAllPatients()
        ]);
        setRecentDoctors(doctorsRes.data.slice(-3).reverse());
        setRecentPatients(patientsRes.data.slice(-3).reverse());
      } catch (err) {
        setRecentDoctors([]);
        setRecentPatients([]);
      }
    };
    fetchRecent();

    // Fetch recent appointments
    const fetchRecentAppointments = async () => {
      try {
        const res = await appointmentService.getAllAppointments();
        setRecentAppointments(res.data.slice(-5).reverse());
      } catch (err) {
        setRecentAppointments([]);
      }
    };
    fetchRecentAppointments();
  }, []);

  // Helper to get relative time
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  // Build a combined recent activities list
  const activities = [
    ...recentDoctors.map(doc => ({
      type: 'Doctor',
      name: doc.name || doc.drName || 'Unknown',
      date: doc.createdAt || doc.registrationDate || doc.date || '',
      details: doc.specialization || doc.specialty || '',
      email: doc.email || '',
      department: doc.department || doc.specialization || doc.specialty || '',
      contact: doc.phone || doc.contact || '',
    })),
    ...recentPatients.map(pat => ({
      type: 'Patient',
      name: pat.name || pat.Name || 'Unknown',
      date: pat.createdAt || pat.registrationDate || pat.date || '',
      details: pat.gender || pat.Gender || '',
      age: pat.age || '',
      contact: pat.phone || pat.contact || '',
    })),
    ...recentAppointments.map(app => ({
      type: 'Appointment',
      name: app.patientName || (app.patient && app.patient.name) || 'Unknown',
      date: app.appointmentDate || app.date || '',
      details: app.status || '',
      doctor: app.doctorName || (app.doctor && app.doctor.name) || '',
      time: app.time || app.appointmentTime || '',
      department: app.department || '',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const systemHealth = {
    server: {
      status: 'Online',
      uptime: '99.9%',
      lastCheck: '2 minutes ago'
    },
    database: {
      status: 'Connected',
      performance: 'Optimal',
      lastBackup: '1 hour ago'
    },
    storage: {
      used: '65%',
      total: '1 TB',
      warning: false
    }
  };

  const quickStats = {
    todayAppointments: 28,
    pendingApprovals: 5,
    activeStaff: 85,
    emergencyRoom: 'Available'
  };

  return (
    <div className="space-y-8 p-6">
      {/* Hospital Overview Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-md mb-8 text-white p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center"><HomeIcon className="h-8 w-8 mr-2 text-white" /> Hospital Overview</h1>
          <p className="mt-1 text-primary-100">Welcome, Admin! Here's a quick overview of your hospital's activity.</p>
        </div>
        <div className="text-right">
          <p className="text-primary-100">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="w-full flex justify-center mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {loading ? (
            <div className="col-span-3 text-center py-8 text-gray-500">Loading stats...</div>
          ) : error ? (
            <div className="col-span-3 text-center py-8 text-red-500">{error}</div>
          ) : (
            stats
              .filter(stat => !stat.name.includes('Revenue'))
              .map((stat) => {
                let linkTo = "/admin/dashboard";
                if (stat.name.includes("Doctor")) linkTo = "/admin/doctors";
                else if (stat.name.includes("Patient")) linkTo = "/admin/patients";
                else if (stat.name.includes("Appointment")) linkTo = "/admin/appointments";
                return (
                  <Link to={linkTo} key={stat.name} className="block">
                    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 hover:shadow-lg transition cursor-pointer flex items-center">
                      <div className={`p-4 rounded-lg bg-${stat.color}-100 mr-4`}>
                        <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-500 mb-1">{stat.name}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </Link>
                );
              })
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><UserPlusIcon className="h-6 w-6 text-primary-600 mr-2" /> Recent Doctors</h2>
          <ul className="divide-y divide-gray-200">
            {recentDoctors.length === 0 ? (
              <li className="py-2 text-gray-500">No recent doctors.</li>
            ) : (
              recentDoctors.map(doc => (
                <li key={doc.id || doc.drId} className="py-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{doc.name || doc.drName || 'Unknown'}</span>
                  <span className="text-xs text-gray-500">{doc.specialization || doc.specialty || ''}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><UserPlusIcon className="h-6 w-6 text-green-600 mr-2" /> Recent Patients</h2>
          <ul className="divide-y divide-gray-200">
            {recentPatients.length === 0 ? (
              <li className="py-2 text-gray-500">No recent patients.</li>
            ) : (
              recentPatients.map(pat => (
                <li key={pat.id || pat.P_ID} className="py-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{pat.name || pat.Name || 'Unknown'}</span>
                  <span className="text-xs text-gray-500">{pat.gender || pat.Gender || ''}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* System Health Card (styled) */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><ServerStackIcon className="h-6 w-6 text-blue-500 mr-2" /> System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <ServerStackIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Server Status</p>
              <p className="text-xs text-gray-500">Uptime: 99.9%</p>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Online</span>
            </div>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <CircleStackIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-xs text-gray-500">Last Backup: 1 hour ago</p>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Connected</span>
            </div>
          </div>
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <CloudIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Storage</p>
              <p className="text-xs text-gray-500">Total: 1 TB</p>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">65% Used</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* System Health */}
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col min-h-[340px] w-full max-w-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center text-gray-900">
            <ServerStackIcon className="h-8 w-8 text-blue-500 mr-3" /> System Health
          </h2>
          <div className="space-y-6">
            {/* Server Status */}
            <div className="flex items-center bg-blue-50 rounded-lg p-5 mb-2">
              <ServerStackIcon className="h-7 w-7 text-blue-400 mr-4" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg">Server Status</div>
                <div className="text-sm text-gray-500">Uptime: 99.9%</div>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-sm">Online</span>
            </div>
            {/* Database */}
            <div className="flex items-center bg-green-50 rounded-lg p-5 mb-2">
              <CircleStackIcon className="h-7 w-7 text-green-400 mr-4" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg">Database</div>
                <div className="text-sm text-gray-500">Last Backup: 1 hour ago</div>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold text-sm">Connected</span>
            </div>
            {/* Storage */}
            <div className="flex items-center bg-yellow-50 rounded-lg p-5">
              <CloudIcon className="h-7 w-7 text-yellow-400 mr-4" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg">Storage</div>
                <div className="text-sm text-gray-500 mb-1">Total: 1 TB</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="h-3 rounded-full bg-green-400" style={{ width: '65%' }}></div>
                </div>
              </div>
              <span className="ml-4 font-bold text-gray-700 text-lg">65%</span>
            </div>
          </div>
        </div>
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col min-h-[340px] w-full max-w-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center text-gray-900">
              <BellAlertIcon className="h-8 w-8 text-primary-600 mr-3" /> Recent Activities
            </h2>
            <Link to="/admin/activities" className="text-base text-teal-600 hover:text-teal-700 font-semibold">View All</Link>
          </div>
          <ul className="space-y-4">
            {activities.length === 0 ? (
              <li className="py-6 text-gray-500 text-lg">No recent activities.</li>
            ) : (
              activities.map((act, idx) => {
                let icon = <UserIcon className="h-7 w-7 text-gray-400" />;
                let borderColor = 'border-blue-400';
                let badgeColor = 'bg-blue-100 text-blue-700';
                if (act.type === 'Doctor') {
                  icon = <UserGroupIcon className="h-7 w-7 text-blue-500" />;
                  borderColor = 'border-blue-400';
                  badgeColor = 'bg-blue-100 text-blue-700';
                } else if (act.type === 'Patient') {
                  icon = <UserPlusIcon className="h-7 w-7 text-green-500" />;
                  borderColor = 'border-green-400';
                  badgeColor = 'bg-green-100 text-green-700';
                } else if (act.type === 'Appointment') {
                  icon = <CalendarIcon className="h-7 w-7 text-purple-500" />;
                  borderColor = 'border-purple-400';
                  badgeColor = 'bg-purple-100 text-purple-700';
                }
                return (
                  <li key={idx} className={`flex items-center bg-gray-50 rounded-lg p-4 border-l-8 ${borderColor} shadow-sm hover:bg-gray-100 transition`}>
                    <div className="mr-4">{icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>{act.type}</span>
                        <span className="font-bold text-gray-900 text-lg">{act.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {act.details && <span>{act.details}</span>}
                        {act.date && <span>{getRelativeTime(act.date)}</span>}
                      </div>
                      {/* Extra details */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-1">
                        {act.type === 'Doctor' && (
                          <>
                            {act.email && <span>Email: {act.email}</span>}
                            {act.department && <span>Dept: {act.department}</span>}
                            {act.contact && <span>Contact: {act.contact}</span>}
                          </>
                        )}
                        {act.type === 'Patient' && (
                          <>
                            {act.age && <span>Age: {act.age}</span>}
                            {act.contact && <span>Contact: {act.contact}</span>}
                          </>
                        )}
                        {act.type === 'Appointment' && (
                          <>
                            {act.doctor && <span>Doctor: {act.doctor}</span>}
                            {act.time && <span>Time: {act.time}</span>}
                            {act.department && <span>Dept: {act.department}</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 