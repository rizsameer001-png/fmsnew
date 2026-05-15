// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { 
//   EyeIcon, 
//   ChatBubbleLeftRightIcon, 
//   StarIcon,
//   ClockIcon,
//   CheckCircleIcon,
//   XCircleIcon
// } from '@heroicons/react/24/outline';
// import complaintService from '../../services/complaint.service';
// import Modal from '../../components/common/Modal';
// import { formatDate, formatDateTime } from '../../utils/formatters';

// const ComplaintStatus = () => {
//   const [selectedComplaint, setSelectedComplaint] = useState(null);
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const { data: complaints, isLoading, refetch } = useQuery({
//     queryKey: ['myComplaints'],
//     queryFn: () => complaintService.getComplaints(),
//   });

//   const getStatusStep = (status) => {
//     const steps = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
//     const index = steps.indexOf(status);
//     return index >= 0 ? index : 0;
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
//       resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   const getPriorityColor = (priority) => {
//     const colors = {
//       low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
//       urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//     };
//     return colors[priority] || 'bg-gray-100 text-gray-800';
//   };

//   const handleRate = async () => {
//     setIsSubmitting(true);
//     await complaintService.addRating(selectedComplaint._id, rating, feedback);
//     await refetch();
//     setSelectedComplaint(null);
//     setRating(0);
//     setFeedback('');
//     setIsSubmitting(false);
//   };

//   const steps = [
//     { label: 'Submitted', icon: ClockIcon },
//     { label: 'Assigned', icon: ChatBubbleLeftRightIcon },
//     { label: 'In Progress', icon: CheckCircleIcon },
//     { label: 'Resolved', icon: CheckCircleIcon },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Complaints</h1>
//         <p className="text-gray-600 dark:text-gray-400 mt-1">Track the status of your complaints</p>
//       </div>

//       {/* Stats Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
//           <p className="text-2xl font-bold text-yellow-600">{complaints?.complaints?.filter(c => c.status === 'pending' || c.status === 'assigned').length || 0}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
//           <p className="text-2xl font-bold text-blue-600">{complaints?.complaints?.filter(c => c.status === 'in_progress').length || 0}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
//           <p className="text-2xl font-bold text-green-600">{complaints?.complaints?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0}</p>
//           <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
//         </div>
//       </div>

//       {/* Complaints List */}
//       <div className="space-y-4">
//         {isLoading ? (
//           <div className="flex justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//           </div>
//         ) : complaints?.complaints?.length === 0 ? (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
//             <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">No complaints found</p>
//             <p className="text-sm text-gray-400 mt-2">All your complaints will appear here</p>
//           </div>
//         ) : (
//           complaints?.complaints?.map((complaint) => (
//             <div key={complaint._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
//               <div className="flex justify-between items-start flex-wrap gap-4">
//                 <div className="flex-1">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{complaint.complaintNumber}</h3>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
//                       {complaint.priority?.toUpperCase()}
//                     </span>
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
//                       {complaint.status?.replace('_', ' ').toUpperCase()}
//                     </span>
//                   </div>
//                   <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mt-2">{complaint.title}</h4>
//                   <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{complaint.description}</p>
//                   <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
//                     <span>📅 {formatDate(complaint.createdAt)}</span>
//                     {complaint.assignedTo && <span>👤 Assigned to: {complaint.assignedTo?.name}</span>}
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => setSelectedComplaint(complaint)}
//                   className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
//                 >
//                   <EyeIcon className="h-4 w-4" />
//                   <span>Track</span>
//                 </button>
//               </div>

//               {/* Progress Bar */}
//               <div className="mt-4">
//                 <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
//                   <span>Submitted</span>
//                   <span>Assigned</span>
//                   <span>In Progress</span>
//                   <span>Resolved</span>
//                 </div>
//                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                   <div 
//                     className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
//                     style={{ width: `${(getStatusStep(complaint.status) / 4) * 100}%` }}
//                   />
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Complaint Details Modal */}
//       {selectedComplaint && (
//         <Modal isOpen={true} onClose={() => setSelectedComplaint(null)} title="Complaint Details" size="lg">
//           <div className="space-y-4 max-h-[70vh] overflow-y-auto">
//             {/* Header */}
//             <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Complaint Number</p>
//                   <p className="font-medium text-gray-900 dark:text-white">{selectedComplaint.complaintNumber}</p>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
//                   <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedComplaint.status)}`}>
//                     {selectedComplaint.status?.toUpperCase()}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Priority</p>
//                   <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedComplaint.priority)}`}>
//                     {selectedComplaint.priority?.toUpperCase
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
//                   <p className="text-sm">{formatDateTime(selectedComplaint.createdAt)}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Title & Description */}
//             <div>
//               <p className="text-xs text-gray-500 dark:text-gray-400">Title</p>
//               <p className="font-medium text-gray-900 dark:text-white">{selectedComplaint.title}</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
//               <p className="text-gray-700 dark:text-gray-300">{selectedComplaint.description}</p>
//             </div>

//             {/* Assigned To */}
//             {selectedComplaint.assignedTo && (
//               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
//                 <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
//                 <p className="font-medium text-gray-900 dark:text-white">{selectedComplaint.assignedTo?.name}</p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedComplaint.assignedTo?.technicianType}</p>
//               </div>
//             )}

//             {/* Resolution */}
//             {selectedComplaint.resolution && (
//               <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
//                 <p className="text-xs text-gray-500 dark:text-gray-400">Resolution</p>
//                 <p className="text-green-700 dark:text-green-300">{selectedComplaint.resolution.description}</p>
//                 <p className="text-xs text-green-600 dark:text-green-400 mt-2">
//                   Resolved on: {formatDateTime(selectedComplaint.resolution.resolvedAt)}
//                 </p>
//               </div>
//             )}

//             {/* Updates Timeline */}
//             {selectedComplaint.updates?.length > 0 && (
//               <div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Updates</p>
//                 <div className="space-y-2">
//                   {selectedComplaint.updates.map((update, idx) => (
//                     <div key={idx} className="flex items-start space-x-2 text-sm">
//                       <div className="h-2 w-2 bg-indigo-600 rounded-full mt-1.5"></div>
//                       <div>
//                         <p className="text-gray-600 dark:text-gray-400">{update.message}</p>
//                         <p className="text-xs text-gray-400">{formatDateTime(update.createdAt)}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Rating Section */}
//             {selectedComplaint.status === 'resolved' && !selectedComplaint.rating && (
//               <div className="border-t pt-4 mt-4">
//                 <p className="font-medium text-gray-900 dark:text-white mb-3">Rate your experience</p>
//                 <div className="flex space-x-2 mb-3">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <button
//                       key={star}
//                       type="button"
//                       onClick={() => setRating(star)}
//                       className="text-2xl focus:outline-none transition-transform hover:scale-110"
//                     >
//                       {star <= rating ? '⭐' : '☆'}
//                     </button>
//                   ))}
//                 </div>
//                 <textarea
//                   rows={3}
//                   value={feedback}
//                   onChange={(e) => setFeedback(e.target.value)}
//                   placeholder="Share your feedback about the service..."
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
//                 />
//                 <button
//                   onClick={handleRate}
//                   disabled={isSubmitting || rating === 0}
//                   className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
//                 >
//                   {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
//                 </button>
//               </div>
//             )}

//             {/* Close Button */}
//             <div className="flex justify-end pt-4 border-t">
//               <button
//                 onClick={() => setSelectedComplaint(null)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default ComplaintStatus;

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  EyeIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import complaintService from '../../services/complaint.service';
import Modal from '../../components/common/Modal';
import { formatDate, formatDateTime } from '../../utils/formatters';

const ComplaintStatus = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: complaints, isLoading, refetch } = useQuery({
    queryKey: ['myComplaints'],
    queryFn: () => complaintService.getComplaints(),
  });

  const getStatusStep = (status) => {
    const steps = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
    const index = steps.indexOf(status);
    return index >= 0 ? index : 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleRate = async () => {
    setIsSubmitting(true);
    await complaintService.addRating(selectedComplaint._id, rating, feedback);
    await refetch();
    setSelectedComplaint(null);
    setRating(0);
    setFeedback('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Complaints</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track the status of your complaints</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{complaints?.complaints?.filter(c => c.status === 'pending' || c.status === 'assigned').length || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{complaints?.complaints?.filter(c => c.status === 'in_progress').length || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{complaints?.complaints?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : complaints?.complaints?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No complaints found</p>
            <p className="text-sm text-gray-400 mt-2">All your complaints will appear here</p>
          </div>
        ) : (
          complaints?.complaints?.map((complaint) => (
            <div key={complaint._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{complaint.complaintNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority?.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                      {complaint.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mt-2">{complaint.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{complaint.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>📅 {formatDate(complaint.createdAt)}</span>
                    {complaint.assignedTo && <span>👤 Assigned to: {complaint.assignedTo?.name}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedComplaint(complaint)}
                  className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Track</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Submitted</span>
                  <span>Assigned</span>
                  <span>In Progress</span>
                  <span>Resolved</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(getStatusStep(complaint.status) / 4) * 100}%` }}
                  />
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
            {/* Header */}
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

            {/* Assigned To */}
            {selectedComplaint.assignedTo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedComplaint.assignedTo?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedComplaint.assignedTo?.technicianType}</p>
              </div>
            )}

            {/* Resolution */}
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

            {/* Rating Section */}
            {selectedComplaint.status === 'resolved' && !selectedComplaint.rating && (
              <div className="border-t pt-4 mt-4">
                <p className="font-medium text-gray-900 dark:text-white mb-3">Rate your experience</p>
                <div className="flex space-x-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl focus:outline-none transition-transform hover:scale-110"
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your feedback about the service..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700"
                />
                <button
                  onClick={handleRate}
                  disabled={isSubmitting || rating === 0}
                  className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ComplaintStatus;