import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { patientService } from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Patients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Blood group options for filter
  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await patientService.getAllPatients();
      console.log("Patient data received:", response.data);
      
      // Debug: Check the structure of the first patient object
      if (response.data && response.data.length > 0) {
        console.log("First patient object:", response.data[0]);
        console.log("Available keys:", Object.keys(response.data[0]));
        
        // Check specifically for blood group and contact fields
        const patient = response.data[0];
        console.log("Checking for blood group field:", {
          direct: patient.Blood_Group,
          bloodGroup: patient.bloodGroup,
          blood_group: patient.blood_group,
          blood: patient.blood
        });
        
        console.log("Checking for contact fields:", {
          Mobile_No: patient.Mobile_No,
          mobileNo: patient.mobileNo, 
          mobile_no: patient.mobile_no,
          phone: patient.phone,
          contact: patient.contact
        });
      }
      
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (patient) => {
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return; // Prevent multiple clicks
    
    setIsDeleting(true);
    try {
      await patientService.deletePatient(getPatientProperty(patientToDelete, 'P_ID'));
      toast.success('Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    } finally {
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
      setIsDeleting(false);
    }
  };

  // Helper function to safely access nested properties
  const getPatientProperty = (patient, key) => {
    // Handle case-insensitive property access
    if (!patient) return null;
    
    // Define common field name variations
    const fieldVariations = {
      'Name': ['name', 'patientName', 'fullName', 'patient_name'],
      'P_ID': ['p_id', 'pid', 'patientId', 'patient_id', 'id'],
      'Mobile_No': ['mobile_no', 'mobileNo', 'mobile', 'phone', 'phoneNumber', 'contact', 'contactNumber'],
      'Email': ['email', 'emailAddress', 'mail', 'email_address'],
      'Age': ['age', 'patient_age'],
      'DOB': ['dob', 'dateOfBirth', 'birth_date', 'birthdate', 'date_of_birth'],
      'Gender': ['gender', 'sex'],
      'Blood_Group': ['blood_group', 'bloodGroup', 'bloodType', 'blood_type', 'blood'],
      'Address': ['address', 'patient_address', 'residence', 'location']
    };
    
    // Try exact match first
    if (patient[key] !== undefined) return patient[key];
    
    // Try case-insensitive match
    const lowerKey = key.toLowerCase();
    const keys = Object.keys(patient);
    const matchingKey = keys.find(k => k.toLowerCase() === lowerKey);
    
    if (matchingKey) return patient[matchingKey];
    
    // Try known variations
    if (fieldVariations[key]) {
      for (const variation of fieldVariations[key]) {
        const foundKey = keys.find(k => k.toLowerCase() === variation.toLowerCase());
        if (foundKey) return patient[foundKey];
      }
    }
    
    console.log(`Could not find a match for key: ${key} in patient object`);
    return null;
  };

  const filteredPatients = patients.filter(patient => {
    // Filter by search query (case-insensitive)
    const name = getPatientProperty(patient, 'Name') || '';
    const email = getPatientProperty(patient, 'Email') || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by blood group if not "all"
    const bloodGroup = getPatientProperty(patient, 'Blood_Group');
    const matchesFilter = selectedFilter === 'all' || bloodGroup === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Patients Management</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search patients by name or email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
          </div>
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Blood Groups</option>
            {bloodGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age/DOB
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blood Group
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  Loading patients...
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No patients found
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.P_ID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{getPatientProperty(patient, 'Name')}</div>
                        <div className="text-sm text-gray-500">ID: #{getPatientProperty(patient, 'P_ID') ? String(getPatientProperty(patient, 'P_ID')).padStart(4, '0') : 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {getPatientProperty(patient, 'Mobile_No') || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {getPatientProperty(patient, 'Email') || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Age: {getPatientProperty(patient, 'Age') || 'N/A'}</div>
                    <div className="text-sm text-gray-500">DOB: {getPatientProperty(patient, 'DOB') || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getPatientProperty(patient, 'Gender') || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPatientProperty(patient, 'Blood_Group') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {getPatientProperty(patient, 'Blood_Group') || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getPatientProperty(patient, 'Address') || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleDelete(patient)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Patient"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <ExclamationTriangleIcon className="h-8 w-8 mr-2" />
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
            </div>
            <p className="mb-6">
              Are you sure you want to delete patient {getPatientProperty(patientToDelete, 'Name')}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients; 