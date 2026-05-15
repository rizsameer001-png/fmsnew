// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import buildingService from '../../services/building.service';
// import userService from '../../services/user.service';
// import Modal from '../../components/common/Modal';
// import ConfirmationDialog from '../../components/common/ConfirmationDialog';

// const BuildingManagement = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [selectedBuilding, setSelectedBuilding] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     code: '',
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       country: 'India',
//       pincode: '',
//       latitude: '',
//       longitude: '',
//     },
//     managerId: '',
//     totalFloors: 0,
//     totalArea: 0,
//     constructionYear: '',
//     status: 'active',
//   });

//   const queryClient = useQueryClient();

//   const { data: buildingsData, isLoading } = useQuery({
//     queryKey: ['buildings'],
//     queryFn: () => buildingService.getBuildings(),
//   });

//   const { data: managersData } = useQuery({
//     queryKey: ['managers'],
//     queryFn: () => userService.getUsers({ role: 'manager' }),
//   });

//   const createMutation = useMutation({
//     mutationFn: (data) => buildingService.createBuilding(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['buildings']);
//       setShowModal(false);
//       resetForm();
//       toast.success('Building created successfully');
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ id, data }) => buildingService.updateBuilding(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['buildings']);
//       setShowModal(false);
//       resetForm();
//       toast.success('Building updated successfully');
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id) => buildingService.deleteBuilding(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['buildings']);
//       setShowDeleteDialog(false);
//       toast.success('Building deleted successfully');
//     },
//   });

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       code: '',
//       address: {
//         street: '',
//         city: '',
//         state: '',
//         country: 'India',
//         pincode: '',
//         latitude: '',
//         longitude: '',
//       },
//       managerId: '',
//       totalFloors: 0,
//       totalArea: 0,
//       constructionYear: '',
//       status: 'active',
//     });
//     setSelectedBuilding(null);
//   };

//   const handleEdit = (building) => {
//     setSelectedBuilding(building);
//     setFormData({
//       name: building.name,
//       code: building.code,
//       address: building.address,
//       managerId: building.managerId?._id || building.managerId || '',
//       totalFloors: building.totalFloors,
//       totalArea: building.totalArea,
//       constructionYear: building.constructionYear || '',
//       status: building.status,
//     });
//     setShowModal(true);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (selectedBuilding) {
//       updateMutation.mutate({ id: selectedBuilding._id, data: formData });
//     } else {
//       createMutation.mutate(formData);
//     }
//   };

//   if (isLoading) {
//     return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Building Management</h1>
//           <p className="text-gray-600 mt-1">Manage all buildings and facilities</p>
//         </div>
//         <button
//           onClick={() => setShowModal(true)}
//           className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           <PlusIcon className="h-5 w-5" />
//           <span>Add Building</span>
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {buildingsData?.buildings?.map((building) => (
//           <div key={building._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
//             <div className="p-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">{building.name}</h3>
//                   <p className="text-sm text-gray-500">Code: {building.code}</p>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                   building.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                 }`}>
//                   {building.status.toUpperCase()}
//                 </span>
//               </div>
              
//               <div className="mt-4 space-y-2">
//                 <div className="flex items-center text-sm text-gray-600">
//                   <MapPinIcon className="h-4 w-4 mr-2" />
//                   {building.address.city}, {building.address.state}
//                 </div>
//                 <div className="flex items-center text-sm text-gray-600">
//                   <BuildingOfficeIcon className="h-4 w-4 mr-2" />
//                   {building.totalFloors} Floors • {building.totalArea} sq ft
//                 </div>
//               </div>
              
//               <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
//                 <button
//                   onClick={() => handleEdit(building)}
//                   className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedBuilding(building);
//                     setShowDeleteDialog(true);
//                   }}
//                   className="text-red-600 hover:text-red-800 text-sm font-medium"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Add/Edit Building Modal */}
//       <Modal
//         isOpen={showModal}
//         onClose={() => {
//           setShowModal(false);
//           resetForm();
//         }}
//         title={selectedBuilding ? 'Edit Building' : 'Add New Building'}
//         size="lg"
//       >
//         <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Building Name *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Building Code *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.code}
//                 onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
//             <input
//               type="text"
//               value={formData.address.street}
//               onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
//               <input
//                 type="text"
//                 value={formData.address.city}
//                 onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//               <input
//                 type="text"
//                 value={formData.address.state}
//                 onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
//               <input
//                 type="text"
//                 value={formData.address.pincode}
//                 onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
//               <select
//                 value={formData.managerId}
//                 onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               >
//                 <option value="">Select Manager</option>
//                 {managersData?.users?.map(manager => (
//                   <option key={manager._id} value={manager._id}>{manager.name}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
//               <input
//                 type="number"
//                 value={formData.totalFloors}
//                 onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (sq ft)</label>
//               <input
//                 type="number"
//                 value={formData.totalArea}
//                 onChange={(e) => setFormData({ ...formData, totalArea: parseInt(e.target.value) })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               >
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//                 <option value="maintenance">Maintenance</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex justify-end space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={() => {
//                 setShowModal(false);
//                 resetForm();
//               }}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={createMutation.isPending || updateMutation.isPending}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//             >
//               {selectedBuilding ? 'Update' : 'Create'}
//             </button>
//           </div>
//         </form>
//       </Modal>

//       <ConfirmationDialog
//         isOpen={showDeleteDialog}
//         onClose={() => setShowDeleteDialog(false)}
//         onConfirm={() => deleteMutation.mutate(selectedBuilding?._id)}
//         title="Delete Building"
//         message={`Are you sure you want to delete ${selectedBuilding?.name}? This will also delete all associated floors and zones.`}
//       />
//     </div>
//   );
// };

// export default BuildingManagement;


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import buildingService from '../../services/building.service';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const BuildingManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
    },
    totalFloors: 0,
    totalArea: 0,
    status: 'active',
  });

  const queryClient = useQueryClient();

  // Fetch all buildings
  const { data: buildingsData, isLoading, refetch } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getBuildings(),
  });

  // Create building mutation
  const createMutation = useMutation({
    mutationFn: (data) => buildingService.createBuilding(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buildings']);
      setShowModal(false);
      resetForm();
      toast.success('Building created successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create building');
    },
  });

  // Update building mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => buildingService.updateBuilding(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['buildings']);
      setShowModal(false);
      resetForm();
      toast.success('Building updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update building');
    },
  });

  // Delete building mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => buildingService.deleteBuilding(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['buildings']);
      setShowDeleteDialog(false);
      setSelectedBuilding(null);
      toast.success('Building deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete building');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
      },
      totalFloors: 0,
      totalArea: 0,
      status: 'active',
    });
    setSelectedBuilding(null);
  };

  const handleEdit = (building) => {
    setSelectedBuilding(building);
    setFormData({
      name: building.name,
      code: building.code,
      address: building.address || {
        street: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
      },
      totalFloors: building.totalFloors || 0,
      totalArea: building.totalArea || 0,
      status: building.status || 'active',
    });
    setShowModal(true);
  };

  const handleView = (building) => {
    setSelectedBuilding(building);
    setShowViewModal(true);
  };

  const handleDelete = (building) => {
    setSelectedBuilding(building);
    setShowDeleteDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedBuilding) {
      updateMutation.mutate({ id: selectedBuilding._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Building Management</h1>
          <p className="text-gray-600 mt-1">Manage all buildings and facilities</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Building</span>
        </button>
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildingsData?.buildings?.map((building) => (
          <div key={building._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{building.name}</h3>
                    <p className="text-sm text-gray-500">Code: {building.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(building.status)}`}>
                  {building.status?.toUpperCase()}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    {building.address?.street}, {building.address?.city}, {building.address?.state}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Floors:</span>
                  <span className="font-medium">{building.totalFloors || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Area:</span>
                  <span className="font-medium">{building.totalArea || 0} sq ft</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                <button
                  onClick={() => handleView(building)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="View Details"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleEdit(building)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Edit Building"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(building)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete Building"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {buildingsData?.buildings?.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No buildings found</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Add your first building
          </button>
        </div>
      )}

      {/* Add/Edit Building Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedBuilding ? 'Edit Building' : 'Add New Building'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Corporate Tower A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., CTA01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={formData.address.pincode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
              <input
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (sq ft)</label>
              <input
                type="number"
                value={formData.totalArea}
                onChange={(e) => setFormData({ ...formData, totalArea: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedBuilding ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Building Modal */}
      <Modal isOpen={showViewModal} onClose={() => { setShowViewModal(false); setSelectedBuilding(null); }} title="Building Details" size="lg">
        {selectedBuilding && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Building Name</p>
                  <p className="font-semibold text-gray-900">{selectedBuilding.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Building Code</p>
                  <p className="font-semibold text-gray-900">{selectedBuilding.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedBuilding.status)}`}>
                    {selectedBuilding.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Floors</p>
                  <p className="font-semibold">{selectedBuilding.totalFloors || 0}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="text-gray-700">
                {selectedBuilding.address?.street && <>{selectedBuilding.address.street}<br /></>}
                {selectedBuilding.address?.city && <>{selectedBuilding.address.city}, </>}
                {selectedBuilding.address?.state && <>{selectedBuilding.address.state}<br /></>}
                {selectedBuilding.address?.country && <>{selectedBuilding.address.country} - </>}
                {selectedBuilding.address?.pincode}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => { setShowViewModal(false); setSelectedBuilding(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setSelectedBuilding(null); }}
        onConfirm={() => deleteMutation.mutate(selectedBuilding?._id)}
        title="Delete Building"
        message={`Are you sure you want to delete "${selectedBuilding?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default BuildingManagement;