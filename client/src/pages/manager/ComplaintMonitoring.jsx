// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { 
//   EyeIcon, 
//   CheckCircleIcon, 
//   ClockIcon,
//   ExclamationTriangleIcon,
//   ArrowPathIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import complaintService from '../../services/complaint.service';
// import Modal from '../../components/common/Modal';
// import { formatDate, formatDateTime } from '../../utils/formatters';

// const ComplaintMonitoring = () => {
//   const [selectedComplaint, setSelectedComplaint] = useState(null);
//   const [filter, setFilter] = useState('all');

//   const { data: complaintsData, isLoading, refetch } = useQuery({
//     queryKey: ['managerComplaints', filter],
//     queryFn: () => complaintService.getComplaints({ status: filter !== 'all' ? filter : undefined }),
//   });

//   const assignMutation = useMutation({
//     mutationFn: ({ id, technicianId }) => complaintService.assignComplaint(id, technicianId),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['managerComplaints']);
//       toast.success('Complaint assigned successfully');
//     },
//   });

//   const { data: techniciansData } = useQuery({
//     queryKey: ['technicians'],
//     queryFn: () => userService.getUsers({ role: 'technician' }),
//   });

//   const getPriorityColor = (priority) => {
//     switch(priority) {
//       case 'urgent': return 'bg-red-100 text-red-800';
//       case 'high': return 'bg-orange-100 text-orange-800';
//       case 'medium': return 'bg-yellow-100 text-yellow-800';
//       default: return 'bg-green-100 text-green-800';
//     }
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'bg-gray-100 text-gray-800',
//       assigned: 'bg-blue-100 text-blue-800',
//       in_progress: 'bg-yellow-100 text-yellow-800',
//       resolved: 'bg-green-100 text-green-800',
//       escalated: 'bg-red-100 text-red-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   const stats = {
//     total: complaintsData?.total || 0,
//     pending: complaintsData?.complaints?.filter(c => c.status === 'pending').length || 0,
//     inProgress: complaintsData?.complaints?.filter(c => c.status === 'in_progress').length || 0,
//     resolved: complaintsData?.complaints?.filter(c => c.status === 'resolved').length || 0,
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Complaint Monitoring</h1>
//           <p className="text-gray-600">Track and manage all customer complaints</p>
//         </div>
//         <button onClick={() => refetch()} className="flex items-center space-x-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
//           <ArrowPathIcon className="h-4 w-4" />
//           <span>Refresh</span>
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Complaints</p><p className="text-2xl font-bold">{stats.total}</p></div><div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center"><ClockIcon className="h-6 w-6 text-gray-600" /></div></div></div>
//         <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div><div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center"><ClockIcon className="h-6 w-6 text-yellow-600" /></div></div></div>
//         <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">In Progress</p><p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p></div><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><ClockIcon className="h-6 w-6 text-blue-600" /></div></div></div>
//         <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Resolved</p><p className="text-2xl font-bold text-green-600">{stats.resolved}</p></div><div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center"><CheckCircleIcon className="h-6 w-6 text-green-600" /></div></div></div>
//       </div>

//       {/* Filter Tabs */}
//       <div className="flex space-x-2 border-b">
//         {['all', 'pending', 'assigned', 'in_progress', 'resolved', 'escalated'].map((status) => (
//           <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 capitalize ${filter === status ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>{status}</button>
//         ))}
//       </div>

//       {/* Complaints List */}
//       <div className="space-y-4">
//         {complaintsData?.complaints?.map((complaint) => (
//           <div key={complaint._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => setSelectedComplaint(complaint)}>
//             <div className="flex justify-between items-start">
//               <div className="flex-1">
//                 <div className="flex items-center space-x-3">
//                   <h3 className="text-lg font-semibold text-gray-900">{complaint.complaintNumber}</h3>
//                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>{complaint.priority.toUpperCase()}</span>
//                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>{complaint.status.replace('_', ' ').toUpperCase()}</span>
//                   {complaint.slaBreached && <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">SLA BREACHED</span>}
//                 </div>
//                 <h4 className="text-md font-medium text-gray-800 mt-2">{complaint.title}</h4>
//                 <p className="text-gray-600 mt-1 line-clamp-2">{complaint.description}</p>
//                 <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
//                   <span>Customer: {complaint.customerId?.name}</span>
//                   <span>Created: {formatDate(complaint.createdAt)}</span>
//                   {complaint.assignedTo && <span>Assigned to: {complaint.assignedTo.name}</span>}
//                 </div>
//               </div>
//               <EyeIcon className="h-5 w-5 text-gray-400" />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Complaint Details Modal */}
//       {selectedComplaint && (
//         <Modal isOpen={true} onClose={() => setSelectedComplaint(null)} title="Complaint Details" size="lg">
//           <div className="space-y-4">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <div className="grid grid-cols-2 gap-4">
//                 <div><label className="text-xs text-gray-500">Complaint Number</label><p className="font-medium">{selectedComplaint.complaintNumber}</p></div>
//                 <div><label className="text-xs text-gray-500">Priority</label><p className={`font-medium ${getPriorityColor(selectedComplaint.priority)} inline-block px-2 py-1 rounded-full text-xs`}>{selectedComplaint.priority}</p></div>
//                 <div><label className="text-xs text-gray-500">Status</label><p className={`font-medium ${getStatusColor(selectedComplaint.status)} inline-block px-2 py-1 rounded-full text-xs`}>{selectedComplaint.status}</p></div>
//                 <div><label className="text-xs text-gray-500">Created</label><p>{formatDateTime(selectedComplaint.createdAt)}</p></div>
//               </div>
//             </div>
//             <div><label className="text-xs text-gray-500">Title</label><p className="font-medium">{selectedComplaint.title}</p></div>
//             <div><label className="text-xs text-gray-500">Description</label><p className="text-gray-700">{selectedComplaint.description}</p></div>
//             <div className="grid grid-cols-2 gap-4">
//               <div><label className="text-xs text-gray-500">Customer</label><p>{selectedComplaint.customerId?.name}<br/><span className="text-xs text-gray-500">{selectedComplaint.customerId?.email}</span></p></div>
//               <div><label className="text-xs text-gray-500">Assigned To</label>
//                 <select onChange={(e) => assignMutation.mutate({ id: selectedComplaint._id, technicianId: e.target.value })} className="mt-1 w-full px-2 py-1 border rounded text-sm">
//                   <option value="">Select Technician</option>
//                   {techniciansData?.users?.map(tech => <option key={tech._id} value={tech._id} selected={selectedComplaint.assignedTo?._id === tech._id}>{tech.name}</option>)}
//                 </select>
//               </div>
//             </div>
//             {selectedComplaint.resolution && <div className="bg-green-50 p-4 rounded-lg"><label className="text-xs font-medium text-green-800">Resolution</label><p className="text-green-700 mt-1">{selectedComplaint.resolution.description}</p><p className="text-xs text-green-600 mt-2">Resolved on: {formatDateTime(selectedComplaint.resolution.resolvedAt)}</p></div>}
//             <div className="flex justify-end space-x-3 pt-4 border-t"><button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 border border-gray-300 rounded-lg">Close</button></div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default ComplaintMonitoring;


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FunnelIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import complaintService from '../../services/complaint.service';
import userService from '../../services/user.service';
import Modal from '../../components/common/Modal';
import { formatDate, formatDateTime } from '../../utils/formatters';

const ComplaintMonitoring = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const queryClient = useQueryClient();

  // Fetch complaints
  const { data: complaintsData, isLoading, refetch } = useQuery({
    queryKey: ['managerComplaints', filter],
    queryFn: () => complaintService.getComplaints({ status: filter !== 'all' ? filter : undefined }),
  });

  // Fetch technicians for assignment
  const { data: techniciansData } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => userService.getUsers({ role: 'technician' }),
  });

  // Assign complaint mutation
  const assignMutation = useMutation({
    mutationFn: ({ id, technicianId }) => complaintService.assignComplaint(id, technicianId),
    onSuccess: () => {
      queryClient.invalidateQueries(['managerComplaints']);
      setShowAssignModal(false);
      setSelectedTechnician('');
      toast.success('Complaint assigned successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign complaint');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }) => complaintService.updateStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['managerComplaints']);
      toast.success('Status updated successfully');
    },
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      closed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      escalated: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: complaintsData?.total || 0,
    pending: complaintsData?.complaints?.filter(c => c.status === 'pending' || c.status === 'assigned').length || 0,
    inProgress: complaintsData?.complaints?.filter(c => c.status === 'in_progress').length || 0,
    resolved: complaintsData?.complaints?.filter(c => c.status === 'resolved').length || 0,
    escalated: complaintsData?.complaints?.filter(c => c.status === 'escalated').length || 0,
  };

  const handleAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = () => {
    if (!selectedTechnician) {
      toast.error('Please select a technician');
      return;
    }
    assignMutation.mutate({ id: selectedComplaint._id, technicianId: selectedTechnician });
  };

  const handleStatusUpdate = (complaint, newStatus) => {
    updateStatusMutation.mutate({ id: complaint._id, status: newStatus });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaint Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all customer complaints</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Escalated</p>
              <p className="text-2xl font-bold text-red-600">{stats.escalated}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {['all', 'pending', 'assigned', 'in_progress', 'resolved', 'escalated'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === status
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {status.replace('_', ' ')}
            {status !== 'all' && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600">
                {status === 'pending' ? stats.pending : 
                 status === 'assigned' ? stats.pending :
                 status === 'in_progress' ? stats.inProgress :
                 status === 'resolved' ? stats.resolved :
                 status === 'escalated' ? stats.escalated : 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaintsData?.complaints?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No complaints found</p>
            <p className="text-sm text-gray-400 mt-2">All complaints are resolved</p>
          </div>
        ) : (
          complaintsData?.complaints?.map((complaint) => (
            <div key={complaint._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{complaint.complaintNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority?.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                      {complaint.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    {complaint.slaBreached && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        SLA BREACHED
                      </span>
                    )}
                  </div>
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">{complaint.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{complaint.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>👤 Customer: {complaint.customerId?.name}</span>
                    <span>📅 Created: {formatDate(complaint.createdAt)}</span>
                    {complaint.assignedTo && (
                      <span>🔧 Assigned to: {complaint.assignedTo?.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <button
                    onClick={() => setSelectedComplaint(complaint)}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  {(!complaint.assignedTo || complaint.status === 'pending') && (
                    <button
                      onClick={() => handleAssign(complaint)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      <span>Assign</span>
                    </button>
                  )}
                  {complaint.status === 'assigned' && (
                    <button
                      onClick={() => handleStatusUpdate(complaint, 'in_progress')}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                    >
                      <ClockIcon className="h-4 w-4" />
                      <span>Start Progress</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <Modal isOpen={true} onClose={() => setSelectedComplaint(null)} title="Complaint Details" size="lg">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Header Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Complaint Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedComplaint.complaintNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Priority</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm">{formatDateTime(selectedComplaint.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Title</p>
              <p className="font-medium text-gray-900 dark:text-white">{selectedComplaint.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
              <p className="text-gray-700 dark:text-gray-300">{selectedComplaint.description}</p>
            </div>

            {/* Customer Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Customer Information</p>
              <p className="font-medium text-gray-900 dark:text-white">{selectedComplaint.customerId?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedComplaint.customerId?.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedComplaint.customerId?.phone}</p>
            </div>

            {/* Assignment Info */}
            {selectedComplaint.assignedTo && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedComplaint.assignedTo?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedComplaint.assignedTo?.technicianType}</p>
              </div>
            )}

            {/* Resolution Info */}
            {selectedComplaint.resolution && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Resolution</p>
                <p className="text-green-700 dark:text-green-300">{selectedComplaint.resolution.description}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Resolved on: {formatDateTime(selectedComplaint.resolution.resolvedAt)}
                </p>
              </div>
            )}

            {/* Updates Timeline */}
            {selectedComplaint.updates?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Updates</p>
                <div className="space-y-2">
                  {selectedComplaint.updates.map((update, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <div className="h-2 w-2 bg-indigo-600 rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{update.message}</p>
                        <p className="text-xs text-gray-400">{formatDateTime(update.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedComplaint.status === 'pending' && (
                <button
                  onClick={() => handleAssign(selectedComplaint)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Assign Technician
                </button>
              )}
              {selectedComplaint.status === 'assigned' && (
                <button
                  onClick={() => handleStatusUpdate(selectedComplaint, 'in_progress')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Mark In Progress
                </button>
              )}
              {selectedComplaint.status === 'in_progress' && (
                <button
                  onClick={() => {
                    const notes = prompt('Enter resolution notes:');
                    if (notes) {
                      updateStatusMutation.mutate({ id: selectedComplaint._id, status: 'resolved', notes });
                      setSelectedComplaint(null);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Technician Modal */}
      <Modal isOpen={showAssignModal} onClose={() => { setShowAssignModal(false); setSelectedTechnician(''); }} title="Assign Technician" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Technician
            </label>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a technician</option>
              {techniciansData?.users?.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.name} - {tech.technicianType || 'Technician'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => { setShowAssignModal(false); setSelectedTechnician(''); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubmit}
              disabled={assignMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintMonitoring;