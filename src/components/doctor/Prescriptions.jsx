import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { prescriptionService, patientService } from '../../services/api';
import { toast } from 'react-toastify';

const Prescriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientMap, setPatientMap] = useState({});
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [formData, setFormData] = useState({
    medicine: '',
    advice: '',
    remark: ''
  });
  const [saving, setSaving] = useState(false);

  // Fetch prescription data when component mounts
  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Reset form data when editing prescription changes
  useEffect(() => {
    if (editingPrescription) {
      setFormData({
        medicine: editingPrescription.medicine || '',
        advice: editingPrescription.advice || '',
        remark: editingPrescription.remark || ''
      });
    } else {
      setFormData({
        medicine: '',
        advice: '',
        remark: ''
      });
    }
  }, [editingPrescription]);

  // Handle input changes in edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open the edit modal for a prescription
  const handleEditClick = (prescription) => {
    setEditingPrescription(prescription);
  };

  // Close the edit modal
  const handleEditClose = () => {
    setEditingPrescription(null);
  };

  // Save edited prescription
  const handleSaveEdit = async () => {
    if (!formData.medicine || !formData.advice) {
      toast.error('Medicine and advice are required');
      return;
    }

    setSaving(true);
    try {
      // Prepare update data - keep all original fields and update medicine, advice, remark
      const updateData = {
        ...editingPrescription,
        medicine: formData.medicine.trim(),
        advice: formData.advice.trim(),
        remark: formData.remark ? formData.remark.trim() : ''
      };

      await prescriptionService.updatePrescription(editingPrescription.prId, updateData);
      toast.success('Prescription updated successfully');
      setEditingPrescription(null);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error('Failed to update prescription');
    } finally {
      setSaving(false);
    }
  };

  // Fetch all prescriptions
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await prescriptionService.getAllPrescriptions();
      console.log('Prescription data:', response.data);
      
      // Store the raw prescription data
      const prescriptionData = response.data || [];
      
      // Fetch patient information for each prescription
      const patientIds = [...new Set(prescriptionData.map(p => p.pId))];
      const patientInfo = {};
      
      // Load patient data for each unique patient ID
      for (const patientId of patientIds) {
        try {
          const patientResponse = await patientService.getPatientById(patientId);
          if (patientResponse && patientResponse.data) {
            patientInfo[patientId] = patientResponse.data;
          }
        } catch (error) {
          console.error(`Error fetching patient ${patientId}:`, error);
        }
      }
      
      setPatientMap(patientInfo);
      setPrescriptions(prescriptionData);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  // Delete a prescription
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionService.deletePrescription(id);
        toast.success('Prescription deleted successfully');
        fetchPrescriptions(); // Refresh the list
      } catch (error) {
        console.error('Error deleting prescription:', error);
        toast.error('Failed to delete prescription');
      }
    }
  };

  // Print a prescription
  const handlePrint = (prescription) => {
    const patientName = getPatientName(prescription.pId);
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
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="patient-info">
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Patient ID:</strong> ${prescription.pId}</p>
            <p><strong>Prescription ID:</strong> ${prescription.prId}</p>
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
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Format a date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString || 'N/A';
    }
  };

  // Get patient name from patient map
  const getPatientName = (patientId) => {
    const patient = patientMap[patientId];
    if (patient) {
      return patient.name || patient.firstName + ' ' + patient.lastName || 'Patient ' + patientId;
    }
    return 'Patient ' + patientId;
  };

  // Get patient age from patient map
  const getPatientAge = (patientId) => {
    const patient = patientMap[patientId];
    return patient?.age || 'N/A';
  };

  // Filter prescriptions by search query
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const patientName = getPatientName(prescription.pId).toLowerCase();
    const query = searchQuery.toLowerCase();
    
    // Skip status filtering if "all" is selected
    const statusMatch = selectedStatus === 'all' || 
      (prescription.status && prescription.status.toLowerCase() === selectedStatus.toLowerCase());
    
    return statusMatch && (
      patientName.includes(query) || 
      (prescription.medicine && prescription.medicine.toLowerCase().includes(query)) ||
      (prescription.advice && prescription.advice.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <button 
          onClick={() => toast.info('Create a new prescription from the appointments page')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          New Prescription
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button 
            onClick={() => fetchPrescriptions()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FunnelIcon className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin h-10 w-10 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && prescriptions.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No prescriptions found</h3>
          <p className="text-gray-600">Create prescriptions from the appointment page</p>
        </div>
      )}

      {/* Prescriptions List */}
      {!loading && prescriptions.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.prId} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-medium">
                        {getPatientName(prescription.pId).substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {getPatientName(prescription.pId)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Age: {getPatientAge(prescription.pId)} | Prescription ID: {prescription.prId}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {prescription.status || 'Active'}
                  </span>
                </div>

                {/* Medication Details */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Medication</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{prescription.medicine}</p>
                  </div>
                </div>

                {/* Advice */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Advice</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{prescription.advice}</p>
                </div>

                {/* Remarks */}
                {prescription.remark && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Remarks</h4>
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">{prescription.remark}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    onClick={() => handleEditClick(prescription)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(prescription.prId)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center gap-1"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                  <button 
                    onClick={() => handlePrint(prescription)}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1"
                  >
                    <PrinterIcon className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination - only show if we have prescriptions */}
      {!loading && prescriptions.length > 0 && (
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
                <span className="font-medium">{filteredPrescriptions.length}</span> of{' '}
                <span className="font-medium">{filteredPrescriptions.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-blue-600 bg-blue-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Edit Prescription Modal */}
      {editingPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-700 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Prescription</h2>
              <button onClick={handleEditClose} className="text-white hover:bg-blue-700 rounded-full p-1">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Patient Info */}
            <div className="bg-blue-50 p-4 flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-800 font-medium">
                  {getPatientName(editingPrescription.pId).substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium">{getPatientName(editingPrescription.pId)}</h3>
                <p className="text-sm text-gray-600">
                  ID: {editingPrescription.pId} | Prescription ID: {editingPrescription.prId}
                </p>
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="p-6">
              {/* Medicine */}
              <div className="mb-6">
                <label htmlFor="medicine" className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="medicine"
                  name="medicine"
                  value={formData.medicine}
                  onChange={handleInputChange}
                  placeholder="Enter medicine name and dosage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Advice */}
              <div className="mb-6">
                <label htmlFor="advice" className="block text-sm font-medium text-gray-700 mb-1">
                  Advice <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="advice"
                  name="advice"
                  value={formData.advice}
                  onChange={handleInputChange}
                  placeholder="Enter usage instructions"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              
              {/* Remark */}
              <div className="mb-6">
                <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <textarea
                  id="remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="Enter any additional remarks or notes"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              {/* Modal Actions */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={handleEditClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions; 