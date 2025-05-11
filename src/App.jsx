import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Logout from './components/auth/Logout';
import Redirect from './components/auth/Redirect';
import AuthDebug from './components/auth/AuthDebug';
import Home from './components/Home';
import Services from './components/Services';
import Doctors from './components/Doctors';
import About from './components/About';
import Contact from './components/Contact';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './utils/auth.jsx';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ChartBarIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmergencyAccess from './components/EmergencyAccess';
import DirectAccess from './components/DirectAccess';
import ForceLogin from './components/auth/ForceLogin';

// Import our new patient components
import PatientDashboard from './components/patient/Dashboard';
import BookAppointment from './components/patient/BookAppointment';
import Appointments from './components/patient/Appointments';
import Prescriptions from './components/patient/Prescriptions';
import UpdateProfile from './components/patient/UpdateProfile';
import ChangePassword from './components/patient/ChangePassword';
import PatientRegistration from './components/PatientRegistration';

// Import doctor components
import DoctorDashboard from './components/doctor/Dashboard';
import DoctorAppointments from './components/doctor/Appointments';
import DoctorPrescriptions from './components/doctor/Prescriptions';
import DoctorProfile from './components/doctor/Profile';
import Patients from './components/doctor/Patients';

// Import admin components
import AdminDashboard from './components/admin/Dashboard';
import AdminDoctors from './components/admin/Doctors';
import AdminPatients from './components/admin/Patients';
import AdminAppointments from './components/admin/Appointments';

const adminSidebarItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Doctors', href: '/admin/doctors', icon: UserGroupIcon },
  { name: 'Patients', href: '/admin/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/admin/appointments', icon: CalendarIcon },
];

const doctorSidebarItems = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: HomeIcon },
  { name: 'Appointments', href: '/doctor/appointments', icon: CalendarIcon },
  { name: 'Prescriptions', href: '/doctor/prescriptions', icon: ClipboardDocumentListIcon },
  { name: 'Patients', href: '/doctor/patients', icon: UserGroupIcon },
  { 
    name: 'My Profile', 
    href: '/doctor/profile', 
    icon: UserIcon,
    highlight: true
  },
];

const patientSidebarItems = [
  { name: 'Dashboard', href: '/patient/dashboard', icon: HomeIcon },
  { 
    name: 'Book Appointment', 
    href: '/patient/book-appointment', 
    icon: CalendarIcon,
    highlight: true 
  },
  { name: 'My Appointments', href: '/patient/appointments', icon: CalendarIcon },
  { name: 'Prescriptions', href: '/patient/prescriptions', icon: ClipboardDocumentListIcon },
  { 
    name: 'My Profile', 
    href: '/patient/profile', 
    icon: UserIcon,
    highlight: true
  },
  { 
    name: 'Change Password', 
    href: '/patient/change-password', 
    icon: LockClosedIcon,
    highlight: false
  },
];

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/doctors" element={<Doctors />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<PatientRegistration />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/forcelogin" element={<ForceLogin />} />
      <Route path="/redirect" element={<Redirect />} />
      <Route path="/debug" element={<AuthDebug />} />
      <Route path="/emergency" element={<EmergencyAccess />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route element={<DashboardLayout sidebarItems={adminSidebarItems} />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="book-appointment/:patientId" element={<BookAppointment />} />
        </Route>
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={<ProtectedRoute requiredRole="DOCTOR" />}>
        <Route element={<DashboardLayout sidebarItems={doctorSidebarItems} />}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="patients" element={<Patients />} />
          <Route path="profile" element={<DoctorProfile />} />
        </Route>
      </Route>

      {/* Patient Routes */}
      <Route path="/patient" element={<ProtectedRoute requiredRole="PATIENT" />}>
        <Route element={<DashboardLayout sidebarItems={patientSidebarItems} />}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="book-appointment/:patientId" element={<BookAppointment />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="profile" element={<UpdateProfile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* Remove direct dashboard access - must be authenticated */}
      {/* <Route path="/dashboard" element={<PatientDashboard />} /> */}

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
