import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import AddDoctor from './AddDoctor';
import { doctorService, specialtyService } from '../../services/api';
import { toast } from 'react-toastify';

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Convert specialties array to a map for easy lookup
  const specialtyMap = specialties.reduce((map, specialty) => {
    map[specialty.spId] = specialty.spName;
    return map;
  }, {});

  useEffect(() => {
    // Fetch doctors and specialties on component mount
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setIsLoadingSpecialties(true);
    try {
      const response = await specialtyService.getAllSpecialties();
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      toast.error('Failed to load specialties');
    } finally {
      setIsLoadingSpecialties(false);
    }
  };

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await doctorService.getAllDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return; // Prevent multiple clicks
    
    setIsDeleting(true);
    try {
      await doctorService.deleteDoctor(doctorToDelete.drId);
      toast.success('Doctor deleted successfully');
      // Refresh the doctors list
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    } finally {
    setIsDeleteModalOpen(false);
    setDoctorToDelete(null);
      setIsDeleting(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    // Filter by search query
    const matchesSearch = doctor.drName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doctor.emailId.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by specialty if needed
    const matchesFilter = selectedFilter === 'all' || doctor.spId.toString() === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Doctor
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5"
            placeholder="Search doctors by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
          </div>
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            disabled={isLoadingSpecialties}
          >
            <option value="all">All Specialties</option>
            {isLoadingSpecialties ? (
              <option value="" disabled>Loading specialties...</option>
            ) : (
              specialties.map((specialty) => (
                <option key={specialty.spId} value={specialty.spId}>
                  {specialty.spName}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Doctor List */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialty
                  </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Loading doctors...
                </td>
              </tr>
            ) : filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No doctors found
                </td>
              </tr>
            ) : (
              filteredDoctors.map(doctor => (
                <tr key={doctor.drId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                        {doctor.picture ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={`http://localhost:8080${doctor.picture}`}
                            alt={doctor.drName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/40?text=Dr";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserGroupIcon className="h-6 w-6 text-primary-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {doctor.drName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Age: {doctor.age}
                        </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {specialtyMap[doctor.spId] || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doctor.emailId}</div>
                    <div className="text-sm text-gray-500">{doctor.mobileNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doctor.experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                      className="text-red-600 hover:text-red-900 ml-4"
                        onClick={() => handleDelete(doctor)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
              ))
            )}
              </tbody>
            </table>
      </div>

      {/* Add Doctor Modal */}
      {isAddModalOpen && (
        <AddDoctor 
          onClose={() => setIsAddModalOpen(false)} 
          onDoctorAdded={() => {
            fetchDoctors();
          }} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <ExclamationTriangleIcon className="h-8 w-8 mr-2" />
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
            </div>
            <p className="mb-6">
              Are you sure you want to delete Dr. {doctorToDelete?.drName}? This action cannot be undone.
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

export default Doctors; 