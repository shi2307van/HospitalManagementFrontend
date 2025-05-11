import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon, 
  UserIcon, 
  CalendarIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { prescriptionService, patientService } from '../../services/api';

// Mock prescription data as a fallback
const MOCK_PRESCRIPTIONS = [
  {
    id: 1,
    patientId: 1,
    doctorId: 101,
    doctor: {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist"
    },
    date: "2025-04-05",
    status: "Active",
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "3 months" },
      { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily at bedtime", duration: "3 months" }
    ],
    instructions: "Take with food. Avoid grapefruit juice with Atorvastatin.",
    notes: "Follow up in 3 months for blood pressure and cholesterol check."
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 301,
    doctor: {
      name: "Dr. Michael Chen",
      specialty: "Neurologist"
    },
    date: "2025-03-20",
    status: "Active",
    medications: [
      { name: "Sumatriptan", dosage: "50mg", frequency: "As needed for migraine, max 2 doses per day", duration: "As needed" }
    ],
    instructions: "Take at first sign of migraine. Rest in a quiet, dark room after taking medication.",
    notes: "If migraines increase in frequency or severity, schedule an appointment immediately."
  }
];

const Prescriptions = () => {
  // States for data and UI
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Active', 'Completed'
  const [doctorMap, setDoctorMap] = useState({});
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the patient ID from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('You must be logged in to view prescriptions');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const patientId = user.id || user.P_ID || user.pId;
      
      if (!patientId) {
        setError('Unable to determine patient ID');
        setLoading(false);
        return;
      }

      console.log('Fetching prescriptions for patient ID:', patientId);
      try {
        // Use the real API service to get prescriptions for this patient
        const response = await prescriptionService.getPrescriptionsByPatient(patientId);
        console.log('Prescriptions API response:', response);
        
        if (response && response.data) {
          // Transform the data to match our expected format
          const prescriptionData = response.data.map(p => ({
            id: p.prId,
            prId: p.prId,
            pId: p.pId,
            apId: p.apId,
            patientId: p.pId,
            medicine: p.medicine,
            advice: p.advice,
            remark: p.remark,
            status: p.status || 'Active',
            date: p.createdAt || new Date().toISOString().split('T')[0]
          }));
          
          setPrescriptions(prescriptionData);
          
          // Try to fetch doctor information for appointments
          const appointmentIds = [...new Set(prescriptionData.map(p => p.apId))];
          console.log('Appointment IDs to fetch doctor info:', appointmentIds);
          
          // Additional doctor information could be fetched here if available
        } else {
          setIsDemoMode(true);
          setPrescriptions(MOCK_PRESCRIPTIONS);
          toast.info('No prescription data found - showing sample data');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Set demo mode with mock data if error
        setIsDemoMode(true);
        setPrescriptions(MOCK_PRESCRIPTIONS);
        toast.info('Using demo mode - showing sample prescription data');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to load prescriptions: ' + error.message);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  // Filter prescriptions based on search query and status filter
  const filteredPrescriptions = prescriptions.filter(prescription => {
    // Handle potential undefined values safely
    const medicineText = prescription.medicine || '';
    const adviceText = prescription.advice || '';
    const remarkText = prescription.remark || '';
    const doctorName = prescription.doctor?.name || '';
    
    const matchesSearch = 
      medicineText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adviceText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remarkText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (prescription.status || '').toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrescriptions.slice(indexOfFirstItem, indexOfLastItem);

  // View prescription details
  const viewPrescriptionDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  // Get status badge colors
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckBadgeIcon className="h-4 w-4 mr-1" />
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ClockIcon className="h-4 w-4 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Download prescription as PDF
  const downloadPrescription = async (prescription) => {
    setDownloading(true);
    setDownloadingId(prescription.id);
    
    try {
      // For now, we'll just generate a simple print view
      const printContent = `
        <html>
          <head>
            <title>Prescription #${prescription.prId}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { text-align: center; color: #2563eb; }
              .header { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
              .patient-info { margin-bottom: 15px; }
              .section { margin-bottom: 15px; }
              .section-title { font-weight: bold; margin-bottom: 5px; }
              .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Prescription</h1>
              <p>Date: ${formatDate(prescription.date) || new Date().toLocaleDateString()}</p>
            </div>
            <div class="patient-info">
              <p><strong>Prescription ID:</strong> ${prescription.prId}</p>
              <p><strong>Patient ID:</strong> ${prescription.pId}</p>
            </div>
            <div class="section">
              <div class="section-title">Medicine:</div>
              <p>${prescription.medicine}</p>
            </div>
            <div class="section">
              <div class="section-title">Advice:</div>
              <p>${prescription.advice}</p>
            </div>
            ${prescription.remark ? `
            <div class="section">
              <div class="section-title">Remarks:</div>
              <p>${prescription.remark}</p>
            </div>` : ''}
            <div class="footer">
              <p>Hospital Management System</p>
            </div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Allow time for styles to be applied before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        toast.success('Prescription downloaded successfully');
      }, 500);
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    } finally {
      setDownloading(false);
      setDownloadingId(null);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  // Helper to create a title from prescription data
  const getPrescriptionTitle = (prescription) => {
    if (prescription.medicine) {
      return prescription.medicine;
    } else if (prescription.medications && prescription.medications.length > 0) {
      return prescription.medications.map(med => med.name).join(', ');
    } else {
      return `Prescription #${prescription.id}`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading prescriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 max-w-md text-center">
          <ExclamationCircleIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">{error}</p>
        </div>
        <button 
          onClick={fetchPrescriptions}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (prescriptions.length === 0 && !isDemoMode) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Prescriptions</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No prescriptions found</h3>
          <p className="text-gray-600 mb-4">You don't have any prescriptions yet.</p>
          <Link 
            to="/patient/appointments" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <CalendarIcon className="h-5 w-5 mr-1" />
            Book an appointment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Prescriptions</h1>
        {isDemoMode && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            Demo Mode
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button 
            onClick={fetchPrescriptions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors md:px-6"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {currentItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No prescriptions match your search criteria.</p>
            </div>
          ) : (
            currentItems.map((prescription) => (
              <div key={prescription.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {getPrescriptionTitle(prescription)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(prescription.date)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(prescription.status)}
                </div>

                {/* Prescription advice summary */}
                {prescription.advice && (
                  <div className="mt-3 text-sm text-gray-500">
                    <p className="line-clamp-2">{prescription.advice}</p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="mt-4 flex justify-end space-x-2 flex-wrap">
                  <button 
                    onClick={() => viewPrescriptionDetails(prescription)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  <button 
                    onClick={() => downloadPrescription(prescription)}
                    disabled={downloading && downloadingId === prescription.id}
                    className={`text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center ${
                      downloading && downloadingId === prescription.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {downloading && downloadingId === prescription.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredPrescriptions.length > itemsPerPage && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === pageNumber 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}

      {/* Prescription Detail Modal */}
      {showModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-semibold">Prescription Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-blue-700 rounded-full p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-4">
              {/* Status Badge */}
              <div className="mb-4">
                {getStatusBadge(selectedPrescription.status)}
              </div>
              
              {/* Prescription Info */}
              <div className="space-y-6">
                {/* Medicine */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Medicine</h3>
                  <p className="text-gray-700">{selectedPrescription.medicine}</p>
                </div>
                
                {/* Advice */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advice</h3>
                  <p className="text-gray-700">{selectedPrescription.advice}</p>
                </div>
                
                {/* Remarks (if available) */}
                {selectedPrescription.remark && (
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Remarks</h3>
                    <p className="text-gray-700">{selectedPrescription.remark}</p>
                  </div>
                )}
                
                {/* Date */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Date</h3>
                  <p className="text-gray-700">{formatDate(selectedPrescription.date)}</p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
              <button
                onClick={() => downloadPrescription(selectedPrescription)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions; 