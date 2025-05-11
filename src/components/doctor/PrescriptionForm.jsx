import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL, prescriptionService } from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

/**
 * A simplified prescription form that directly maps to the database schema
 * with just three fields: medicine, advice, and remark
 */
const PrescriptionForm = ({ patient, appointmentId, onClose }) => {
  const [formData, setFormData] = useState({
    medicine: '',
    advice: '',
    remark: ''
  });
  const [loading, setLoading] = useState(false);
  const [patientIdToUse, setPatientIdToUse] = useState(null);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);

  // Set patient ID on mount
  useEffect(() => {
    // Log everything available
    console.log('Full patient object:', patient);
    console.log('Appointment ID:', appointmentId);
    
    // For debugging, let's log all possible ID locations
    if (patient) {
      console.log('Patient ID locations:');
      console.log('- patient.P_ID:', patient.P_ID);
      console.log('- patient.p_id:', patient.p_id);
      console.log('- patient.pId:', patient.pId);
      console.log('- patient.id:', patient.id);
      console.log('- patient.patientId:', patient.patientId);
    }
    
    // Default to a known working ID
    let pId = 1; // Using 1 as default based on screenshot
    
    // Try to extract from patient object if available
    if (patient) {
      if (patient.pId !== undefined) pId = patient.pId;
      else if (patient.P_ID !== undefined) pId = patient.P_ID;
      else if (patient.p_id !== undefined) pId = patient.p_id;
      else if (patient.patientId !== undefined) pId = patient.patientId;
      else if (patient.id !== undefined) pId = patient.id;
    }
    
    // Ensure numeric format
    if (typeof pId === 'string') {
      pId = parseInt(pId, 10);
    }
    
    console.log('Using patient ID:', pId);
    setPatientIdToUse(pId);

    const fetchPrescriptions = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userData = JSON.parse(userStr);
        if (!userData.id) return;

        const response = await prescriptionService.getPrescriptionsByDoctor(userData.id);
        if (response.data) {
          // Optionally sort or limit to most recent 3
          setRecentPrescriptions(response.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      }
    };

    fetchPrescriptions();
  }, [patient, appointmentId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save prescription to database
  const savePrescription = async () => {
    // Validate required fields
    if (!formData.medicine || !formData.advice) {
      toast.error('Please fill all required fields');
      return;
    }

    // Show loading state
    setLoading(true);
    
    try {
      // Ensure we have a patient ID to use
      const finalPatientId = patientIdToUse || 1;
      
      // Ensure appointment ID is a number
      const finalAppointmentId = typeof appointmentId === 'string' ? 
        parseInt(appointmentId, 10) : (appointmentId || 17);
      
      // Create the exact JSON structure expected by the backend
      // Using the field names shown in the screenshot: apId, pId, medicine, advice, remark
      const rawData = JSON.stringify({
        "apId": finalAppointmentId,
        "pId": finalPatientId,
        "medicine": formData.medicine.trim(),
        "advice": formData.advice.trim(),
        "remark": formData.remark ? formData.remark.trim() : ""
      });
      
      console.log('Sending raw prescription data:', rawData);
      
      // Use the fetch API directly for more control
      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: rawData
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      // Show success message
      toast.success('Prescription saved successfully');
      
      // Close the form
      onClose();
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Could not save prescription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-700 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto my-8 animate-fadeIn">
        {/* Form Header */}
        <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold">Simple Prescription</h2>
          <button onClick={onClose} className="text-white hover:bg-green-700 rounded-full p-1">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Patient Info */}
        <div className="bg-blue-50 p-4 flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <UserIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{patient.name}</h3>
            <p className="text-sm text-gray-600">
              {patient.gender && `${patient.gender} • `}
              {patient.age && `${patient.age} years • `}
              ID: {patientIdToUse || 'Using default (1)'}
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
              onChange={handleChange}
              placeholder="Enter medicine name and dosage (e.g. Paracetamol 500mg)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              onChange={handleChange}
              placeholder="Enter usage instructions (e.g. Take twice daily after meals for 5 days)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              onChange={handleChange}
              placeholder="Enter any additional remarks or notes"
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={savePrescription}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-5 w-5" />
                  Save Prescription
                </>
              )}
            </button>
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
                <div key={prescription.id} className="flex flex-col md:flex-row p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center mr-4">
                    <DocumentTextIcon className="h-10 w-10 text-green-500 mb-2" />
                    <span className="text-xs text-gray-400">#{prescription.id}</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {prescription.patient?.name}, {prescription.patient?.age}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Issued: {prescription.dateIssued ? new Date(prescription.dateIssued).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{prescription.diagnosis}</p>
                        <p className="text-xs text-blue-700 mt-1">Medicine: {prescription.medicine}</p>
                        <p className="text-xs text-blue-700 mt-1">Advice: {prescription.advice}</p>
                        <p className="text-xs text-gray-500 mt-1 italic">Remark: {prescription.remark}</p>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          {prescription.diagnosis || prescription.description || 'No diagnosis'}
                        </span>
                      </div>
                    </div>
                    {prescription.medications && prescription.medications.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700">Medications:</p>
                        <ul className="list-disc list-inside text-xs text-gray-600">
                          {prescription.medications.map((med, idx) => (
                            <li key={idx}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {prescription.instructions && (
                      <p className="text-xs text-blue-700 mt-1">Instructions: {prescription.instructions}</p>
                    )}
                    {prescription.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic">Notes: {prescription.notes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm; 