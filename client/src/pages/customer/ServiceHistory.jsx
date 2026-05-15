import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarIcon, 
  StarIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import complaintService from '../../services/complaint.service';
import { formatDate } from '../../utils/formatters';

const ServiceHistory = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['serviceHistory'],
    queryFn: () => complaintService.getComplaints({ status: 'closed,resolved' }),
  });

  const filteredComplaints = complaints?.complaints?.filter(c => 
    filter === 'all' || c.serviceType === filter
  );

  const serviceTypes = ['all', 'cleaning', 'electrical', 'plumbing', 'hvac', 'security'];

  const stats = {
    total: complaints?.complaints?.length || 0,
    avgRating: (complaints?.complaints?.reduce((sum, c) => sum + (c.rating || 0), 0) / (complaints?.complaints?.length || 1)).toFixed(1),
    mostUsed: complaints?.complaints?.reduce((acc, c) => {
      acc[c.serviceType] = (acc[c.serviceType] || 0) + 1;
      return acc;
    }, {}),
  };

  const getMostUsedService = () => {
    if (!stats.mostUsed) return 'N/A';
    return Object.entries(stats.mostUsed).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  };

  const getServiceIcon = (type) => {
    const icons = {
      cleaning: '🧹',
      electrical: '⚡',
      plumbing: '🚰',
      hvac: '❄️',
      security: '🛡️',
      pest: '🐜',
      carpentry: '🔨',
      other: '📝',
    };
    return icons[type] || '📋';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service History</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View all your past service requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.avgRating} ★</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Most Used Service</p>
          <p className="text-2xl font-bold text-indigo-600 capitalize">{getMostUsedService()}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {serviceTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === type
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {type === 'all' ? 'All' : type}
          </button>
        ))}
      </div>

      {/* Service List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredComplaints?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No service history found</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div key={complaint._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                onClick={() => setExpandedId(expandedId === complaint._id ? null : complaint._id)}
              >
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getServiceIcon(complaint.serviceType)}</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {complaint.complaintNumber}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        COMPLETED
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{complaint.title}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{complaint.serviceType}</span>
                      <span>📅 {formatDate(complaint.resolution?.resolvedAt || complaint.updatedAt)}</span>
                      {complaint.rating && <span>⭐ {complaint.rating}/5</span>}
                    </div>
                  </div>
                  {expandedId === complaint._id ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedId === complaint._id && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                      <p className="text-gray-700 dark:text-gray-300">{complaint.description}</p>
                    </div>
                    {complaint.resolution && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Resolution</p>
                        <p className="text-gray-700 dark:text-gray-300">{complaint.resolution.description}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Technician</p>
                      <p className="font-medium text-gray-900 dark:text-white">{complaint.assignedTo?.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{complaint.assignedTo?.technicianType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completed On</p>
                      <p>{formatDate(complaint.resolution?.resolvedAt)}</p>
                    </div>
                  </div>
                  {complaint.feedback && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your Feedback</p>
                      <p className="text-gray-700 dark:text-gray-300">{complaint.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceHistory;