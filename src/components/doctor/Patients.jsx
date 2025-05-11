import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { patientService } from '../../services/api';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../services/api';

const Patients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        let doctorId = user?.id;
        if (typeof doctorId === 'string') {
          doctorId = doctorId.trim().replace(/\.$/, '');
        }
        if (typeof doctorId === 'number') {
          doctorId = doctorId.toString();
        }
        if (!doctorId) {
          toast.error('Doctor ID not found.');
          setPatients([]);
          setIsLoading(false);
          return;
        }
        const url = `${API_BASE_URL}/patients/doctor/${doctorId}`;
        console.log('Fetching patients from:', url);
        const res = await fetch(url);
        const contentType = res.headers.get('content-type');
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Fetch failed:', errorText);
          throw new Error(`Status: ${res.status}, Response: ${errorText}`);
        }
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await res.text();
          console.error('Non-JSON response:', errorText);
          throw new Error(`Expected JSON, got: ${errorText.substring(0, 100)}`);
        }
        const data = await res.json();
        console.log('Fetched patient data:', data);
        const mappedPatients = (data || []).map(p => ({
          id: p.pId,
          name: p.name,
          email: p.email,
          phone: p.mobileNo,
          age: p.age,
          dob: p.dob,
          gender: p.gender,
          bloodGroup: p.bloodGroup,
          address: p.address,
          status: 'Active',
          lastVisit: '-',
          appointments: '-'
        }));
        setPatients(mappedPatients);
      } catch (err) {
        let message = 'Failed to fetch patients for this doctor.';
        if (err instanceof Error) {
          message += ` (${err.message})`;
        }
        toast.error(message);
        setPatients([]);
      }
      setIsLoading(false);
    };
    fetchPatients();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      const updatedPatients = patients.filter(patient => patient.id !== id);
      setPatients(updatedPatients);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Management</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <PlusIcon className="h-5 w-5" />
          Add New Patient
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="relative shadow-md sm:rounded-lg border">
        <div 
          className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#D1D5DB #F3F4F6',
            msOverflowStyle: 'auto'
          }}
        >
          <table className="min-w-[1200px] w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Age</th>
                <th className="px-6 py-3">DOB</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Blood Group</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-8">Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8">No patients found.</td></tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.dob}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.bloodGroup}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{patient.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">10</span> of{' '}
              <span className="font-medium">20</span> results
            </p>
          </div>
          <div>
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
        </div>
      </div>
    </div>
  );
};

export default Patients; 