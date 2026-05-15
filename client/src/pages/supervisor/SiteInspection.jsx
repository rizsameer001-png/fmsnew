// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { 
//   CameraIcon, 
//   DocumentTextIcon, 
//   MapPinIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   EyeIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import reportService from '../../services/report.service';
// import Modal from '../../components/common/Modal';

// const SiteInspection = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [selectedInspection, setSelectedInspection] = useState(null);
//   const [formData, setFormData] = useState({
//     buildingId: '',
//     area: '',
//     findings: '',
//     status: 'pending',
//     photos: [],
//     recommendations: '',
//   });
//   const [files, setFiles] = useState([]);

//   const queryClient = useQueryClient();

//   // ✅ FIX: Access the inspections array correctly
//   const { data: inspectionsData, isLoading } = useQuery({
//     queryKey: ['inspections'],
//     queryFn: () => reportService.getInspections(),
//   });
  
//   // ✅ Extract inspections array from response
//   const inspections = inspectionsData?.inspections || [];

//   const createMutation = useMutation({
//     mutationFn: (data) => reportService.createInspection(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['inspections']);
//       setShowModal(false);
//       resetForm();
//       toast.success('Inspection report submitted');
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to submit inspection');
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }) => reportService.updateInspection(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['inspections']);
//       setShowModal(false);
//       resetForm();
//       toast.success('Inspection updated');
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id) => reportService.deleteInspection(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['inspections']);
//       toast.success('Inspection deleted');
//     },
//   });

//   const resetForm = () => {
//     setFormData({
//       buildingId: '',
//       area: '',
//       findings: '',
//       status: 'pending',
//       photos: [],
//       recommendations: '',
//     });
//     setFiles([]);
//     setSelectedInspection(null);
//   };

//   const handleEdit = (inspection) => {
//     setSelectedInspection(inspection);
//     setFormData({
//       buildingId: inspection.buildingId?._id || inspection.buildingId,
//       area: inspection.area,
//       findings: inspection.findings,
//       status: inspection.status,
//       photos: inspection.photos || [],
//       recommendations: inspection.recommendations || '',
//     });
//     setShowModal(true);
//   };

//   const handleDelete = (inspection) => {
//     if (window.confirm('Are you sure you want to delete this inspection report?')) {
//       deleteMutation.mutate(inspection._id);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (selectedInspection) {
//       updateMutation.mutate({ id: selectedInspection._id, data: formData });
//     } else {
//       createMutation.mutate(formData);
//     }
//   };

//   const handleFileChange = (e) => {
//     const selected = Array.from(e.target.files);
//     setFiles(selected);
//     const imageUrls = selected.map(f => URL.createObjectURL(f));
//     setFormData({ ...formData, photos: imageUrls });
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       pending: 'bg-yellow-100 text-yellow-800',
//       approved: 'bg-green-100 text-green-800',
//       rejected: 'bg-red-100 text-red-800',
//       in_progress: 'bg-blue-100 text-blue-800',
//     };
//     return badges[status] || 'bg-gray-100 text-gray-800';
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center py-12">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Inspection</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">Conduct and manage site inspections</p>
//         </div>
//         <button
//           onClick={() => setShowModal(true)}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//         >
//           New Inspection
//         </button>
//       </div>

//       {/* Inspections Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {inspections.map((inspection) => (
//           <div key={inspection._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
//             <div className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <div className="flex items-center space-x-2">
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       {inspection.inspectionNumber}
//                     </h3>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(inspection.status)}`}>
//                       {inspection.status.toUpperCase()}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     {inspection.buildingId?.name}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => handleEdit(inspection)}
//                     className="p-1 text-blue-600 hover:text-blue-800"
//                   >
//                     <EyeIcon className="h-5 w-5" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(inspection)}
//                     className="p-1 text-red-600 hover:text-red-800"
//                   >
//                     <XCircleIcon className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
              
//               <div className="mt-4">
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   <strong>Area:</strong> {inspection.area}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
//                   <strong>Findings:</strong> {inspection.findings}
//                 </p>
//                 {inspection.recommendations && (
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
//                     <strong>Recommendations:</strong> {inspection.recommendations}
//                   </p>
//                 )}
//                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//                   Created: {new Date(inspection.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {inspections.length === 0 && (
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
//           <DocumentTextIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//           <p className="text-gray-500 dark:text-gray-400">No inspection reports found</p>
//           <button
//             onClick={() => setShowModal(true)}
//             className="mt-4 text-indigo-600 hover:text-indigo-700"
//           >
//             Create your first inspection
//           </button>
//         </div>
//       )}

//       {/* Inspection Modal */}
//       <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedInspection ? 'Edit Inspection' : 'New Inspection'} size="lg">
//         <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
//             <select
//               required
//               value={formData.buildingId}
//               onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//             >
//               <option value="">Select Building</option>
//               {/* Add building options here */}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area / Location</label>
//             <input
//               type="text"
//               required
//               value={formData.area}
//               onChange={(e) => setFormData({ ...formData, area: e.target.value })}
//               placeholder="e.g., Main Hall, Floor 2, Room 205"
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Findings / Observations</label>
//             <textarea
//               rows={4}
//               required
//               value={formData.findings}
//               onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
//               placeholder="Describe the findings and observations..."
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendations</label>
//             <textarea
//               rows={2}
//               value={formData.recommendations}
//               onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
//               placeholder="Any recommendations or follow-up actions..."
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
//             <select
//               value={formData.status}
//               onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//             >
//               <option value="pending">Pending</option>
//               <option value="in_progress">In Progress</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photos (Optional)</label>
//             <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="photoUpload"
//               />
//               <label htmlFor="photoUpload" className="cursor-pointer flex flex-col items-center">
//                 <CameraIcon className="h-8 w-8 text-gray-400" />
//                 <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click to upload photos</span>
//               </label>
//             </div>
//             {files.length > 0 && (
//               <div className="mt-3">
//                 <p className="text-sm text-green-600">{files.length} file(s) selected</p>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={() => { setShowModal(false); resetForm(); }}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={createMutation.isPending || updateMutation.isPending}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//             >
//               {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedInspection ? 'Update' : 'Submit')}
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// };

// export default SiteInspection;


// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { 
//   CameraIcon, 
//   DocumentTextIcon, 
//   MapPinIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   EyeIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import reportService from '../../services/report.service';
// import buildingService from '../../services/building.service';  // ⬅️ ADD THIS IMPORT
// import Modal from '../../components/common/Modal';

// const SiteInspection = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [selectedInspection, setSelectedInspection] = useState(null);
//   const [formData, setFormData] = useState({
//     buildingId: '',
//     area: '',
//     findings: '',
//     status: 'pending',
//     photos: [],
//     recommendations: '',
//   });
//   const [files, setFiles] = useState([]);

//   const queryClient = useQueryClient();

//   // Fetch inspections
//   const { data: inspectionsData, isLoading } = useQuery({
//     queryKey: ['inspections'],
//     queryFn: () => reportService.getInspections(),
//   });
  
//   // ⬇️⬇️⬇️ ADD THIS: Fetch buildings for dropdown ⬇️⬇️⬇️
//   const { data: buildingsData, isLoading: buildingsLoading } = useQuery({
//     queryKey: ['buildings'],
//     queryFn: () => buildingService.getBuildings(),
//   });

//   const inspections = inspectionsData?.inspections || [];
//   const buildings = buildingsData?.buildings || [];

//   const createMutation = useMutation({
//     mutationFn: (data) => reportService.createInspection(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['inspections']);
//       setShowModal(false);
//       resetForm();
//       toast.success('Inspection report submitted');
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to submit inspection');
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }) => reportService.updateInspection(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['inspections']);
//       setShowModal(false);
//       resetForm();
//       toast.success('Inspection updated');
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id) => reportService.deleteInspection(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['inspections']);
//       toast.success('Inspection deleted');
//     },
//   });

//   const resetForm = () => {
//     setFormData({
//       buildingId: '',
//       area: '',
//       findings: '',
//       status: 'pending',
//       photos: [],
//       recommendations: '',
//     });
//     setFiles([]);
//     setSelectedInspection(null);
//   };

//   const handleEdit = (inspection) => {
//     setSelectedInspection(inspection);
//     setFormData({
//       buildingId: inspection.buildingId?._id || inspection.buildingId,
//       area: inspection.area,
//       findings: inspection.findings,
//       status: inspection.status,
//       photos: inspection.photos || [],
//       recommendations: inspection.recommendations || '',
//     });
//     setShowModal(true);
//   };

//   const handleDelete = (inspection) => {
//     if (window.confirm('Are you sure you want to delete this inspection report?')) {
//       deleteMutation.mutate(inspection._id);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (selectedInspection) {
//       updateMutation.mutate({ id: selectedInspection._id, data: formData });
//     } else {
//       createMutation.mutate(formData);
//     }
//   };

//   const handleFileChange = (e) => {
//     const selected = Array.from(e.target.files);
//     setFiles(selected);
//     const imageUrls = selected.map(f => URL.createObjectURL(f));
//     setFormData({ ...formData, photos: imageUrls });
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//       in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//     };
//     return badges[status] || 'bg-gray-100 text-gray-800';
//   };

//   if (isLoading || buildingsLoading) {
//     return (
//       <div className="flex justify-center py-12">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Inspection</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">Conduct and manage site inspections</p>
//         </div>
//         <button
//           onClick={() => setShowModal(true)}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//         >
//           New Inspection
//         </button>
//       </div>

//       {/* Inspections Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {inspections.map((inspection) => (
//           <div key={inspection._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
//             <div className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <div className="flex items-center space-x-2">
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                       {inspection.inspectionNumber}
//                     </h3>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(inspection.status)}`}>
//                       {inspection.status.toUpperCase()}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     {inspection.buildingId?.name}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => handleEdit(inspection)}
//                     className="p-1 text-blue-600 hover:text-blue-800"
//                   >
//                     <EyeIcon className="h-5 w-5" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(inspection)}
//                     className="p-1 text-red-600 hover:text-red-800"
//                   >
//                     <XCircleIcon className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>
              
//               <div className="mt-4">
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   <strong>Area:</strong> {inspection.area}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
//                   <strong>Findings:</strong> {inspection.findings}
//                 </p>
//                 {inspection.recommendations && (
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
//                     <strong>Recommendations:</strong> {inspection.recommendations}
//                   </p>
//                 )}
//                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//                   Created: {new Date(inspection.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {inspections.length === 0 && (
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
//           <DocumentTextIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//           <p className="text-gray-500 dark:text-gray-400">No inspection reports found</p>
//           <button
//             onClick={() => setShowModal(true)}
//             className="mt-4 text-indigo-600 hover:text-indigo-700"
//           >
//             Create your first inspection
//           </button>
//         </div>
//       )}

//       {/* Inspection Modal */}
//       <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedInspection ? 'Edit Inspection' : 'New Inspection'} size="lg">
//         <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
//           {/* ⬇️⬇️⬇️ UPDATED: Building dropdown with options ⬇️⬇️⬇️ */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Building *
//             </label>
//             <select
//               required
//               value={formData.buildingId}
//               onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               <option value="">Select Building</option>
//               {buildings.map((building) => (
//                 <option key={building._id} value={building._id}>
//                   {building.name} ({building.code})
//                 </option>
//               ))}
//             </select>
//             {buildings.length === 0 && (
//               <p className="text-xs text-yellow-600 mt-1">
//                 No buildings available. Please add buildings first.
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Area / Location *
//             </label>
//             <input
//               type="text"
//               required
//               value={formData.area}
//               onChange={(e) => setFormData({ ...formData, area: e.target.value })}
//               placeholder="e.g., Main Hall, Floor 2, Room 205"
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Findings / Observations *
//             </label>
//             <textarea
//               rows={4}
//               required
//               value={formData.findings}
//               onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
//               placeholder="Describe the findings and observations..."
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Recommendations
//             </label>
//             <textarea
//               rows={2}
//               value={formData.recommendations}
//               onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
//               placeholder="Any recommendations or follow-up actions..."
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Status
//             </label>
//             <select
//               value={formData.status}
//               onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
//             >
//               <option value="pending">Pending</option>
//               <option value="in_progress">In Progress</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Photos (Optional)
//             </label>
//             <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="photoUpload"
//               />
//               <label htmlFor="photoUpload" className="cursor-pointer flex flex-col items-center">
//                 <CameraIcon className="h-8 w-8 text-gray-400" />
//                 <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click to upload photos</span>
//               </label>
//             </div>
//             {files.length > 0 && (
//               <div className="mt-3">
//                 <p className="text-sm text-green-600">{files.length} file(s) selected</p>
//               </div>
//             )}
//           </div>

//           <div className="flex justify-end space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={() => { setShowModal(false); resetForm(); }}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={createMutation.isPending || updateMutation.isPending}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//             >
//               {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedInspection ? 'Update' : 'Submit')}
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// };

// export default SiteInspection;


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CameraIcon, 
  DocumentTextIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import reportService from '../../services/report.service';
import buildingService from '../../services/building.service';
import Modal from '../../components/common/Modal';

const SiteInspection = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [formData, setFormData] = useState({
    buildingId: '',
    area: '',
    findings: '',
    status: 'pending',
    photos: [],
    recommendations: '',
  });
  const [files, setFiles] = useState([]);

  const queryClient = useQueryClient();

  // Fetch inspections
  const { data: inspectionsData, isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => reportService.getInspections(),
  });
  
  // Fetch buildings for dropdown
  const { data: buildingsData, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getBuildings(),
  });

  const inspections = inspectionsData?.inspections || [];
  const buildings = buildingsData?.buildings || [];

  const createMutation = useMutation({
    mutationFn: (data) => reportService.createInspection(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inspections']);
      setShowModal(false);
      resetForm();
      toast.success('Inspection report submitted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit inspection');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => reportService.updateInspection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inspections']);
      setShowModal(false);
      resetForm();
      toast.success('Inspection updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => reportService.deleteInspection(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['inspections']);
      toast.success('Inspection deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      buildingId: '',
      area: '',
      findings: '',
      status: 'pending',
      photos: [],
      recommendations: '',
    });
    setFiles([]);
    setSelectedInspection(null);
  };

  const handleEdit = (inspection) => {
    setSelectedInspection(inspection);
    setFormData({
      buildingId: inspection.buildingId?._id || inspection.buildingId,
      area: inspection.area,
      findings: inspection.findings,
      status: inspection.status,
      photos: inspection.photos || [],
      recommendations: inspection.recommendations || '',
    });
    setShowModal(true);
  };

  const handleDelete = (inspection) => {
    if (window.confirm('Are you sure you want to delete this inspection report?')) {
      deleteMutation.mutate(inspection._id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedInspection) {
      updateMutation.mutate({ id: selectedInspection._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const imageUrls = selected.map(f => URL.createObjectURL(f));
    setFormData({ ...formData, photos: imageUrls });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading || buildingsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Inspection</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Conduct and manage site inspections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          New Inspection
        </button>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inspections.map((inspection) => (
          <div key={inspection._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {inspection.inspectionNumber}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(inspection.status)}`}>
                      {inspection.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {inspection.buildingId?.name}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(inspection)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(inspection)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Area:</strong> {inspection.area}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                  <strong>Findings:</strong> {inspection.findings}
                </p>
                {inspection.recommendations && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    <strong>Recommendations:</strong> {inspection.recommendations}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  Created: {new Date(inspection.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {inspections.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No inspection reports found</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Create your first inspection
          </button>
        </div>
      )}

      {/* Inspection Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedInspection ? 'Edit Inspection' : 'New Inspection'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
          {/* Building Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Building *
            </label>
            <select
              required
              value={formData.buildingId}
              onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Building</option>
              {buildings.map((building) => (
                <option key={building._id} value={building._id}>
                  {building.name} ({building.code})
                </option>
              ))}
            </select>
            {buildings.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">
                No buildings available. Please add buildings first.
              </p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Area / Location *
            </label>
            <input
              type="text"
              required
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g., Main Hall, Floor 2, Room 205"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Findings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Findings / Observations *
            </label>
            <textarea
              rows={4}
              required
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              placeholder="Describe the findings and observations..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recommendations
            </label>
            <textarea
              rows={2}
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Any recommendations or follow-up actions..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photoUpload"
              />
              <label htmlFor="photoUpload" className="cursor-pointer flex flex-col items-center">
                <CameraIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click to upload photos</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-green-600">{files.length} file(s) selected</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedInspection ? 'Update' : 'Submit')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SiteInspection;