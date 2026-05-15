import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import attendanceService from '../../services/attendance.service';
import buildingService from '../../services/building.service';
import userService from '../../services/user.service';
import notificationService from '../../services/notification.service';
import Modal from '../../components/common/Modal';
import { formatDate, formatDateTime } from '../../utils/formatters';

const AttendanceMonitoring = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const queryClient = useQueryClient();

  // Get current user role
  const userRole = JSON.parse(localStorage.getItem('user'))?.role || 'super_admin';

  // Fetch buildings for filter (admin only)
  const { data: buildingsData } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => buildingService.getBuildings(),
    enabled: userRole === 'super_admin'
  });

  // Fetch team attendance based on role
  const { data: attendanceData, isLoading, refetch } = useQuery({
    queryKey: ['teamAttendance', selectedDate, selectedBuilding, selectedRole, selectedStatus, searchTerm],
    queryFn: () => attendanceService.getTeamAttendance({ 
      date: selectedDate, 
      buildingId: selectedBuilding !== 'all' ? selectedBuilding : undefined,
      role: selectedRole !== 'all' ? selectedRole : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      search: searchTerm
    }),
  });

  // Fetch attendance stats
  const { data: statsData } = useQuery({
    queryKey: ['attendanceStats', selectedDate],
    queryFn: () => attendanceService.getAttendanceStats({ date: selectedDate }),
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: (data) => notificationService.sendNotification?.(data) || Promise.resolve(),
    onSuccess: () => {
      toast.success('Notification sent successfully');
      setShowNotificationModal(false);
      setNotificationMessage('');
      setSelectedEmployee(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    }
  });

  // Approve attendance mutation
  const approveAttendanceMutation = useMutation({
    mutationFn: ({ id, status, notes }) => attendanceService.approveAttendance(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamAttendance']);
      queryClient.invalidateQueries(['attendanceStats']);
      toast.success('Attendance updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update attendance');
    }
  });

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      half_day: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      leave: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'absent': return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'late': return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default: return null;
    }
  };

  const handleSendNotification = (employee) => {
    setSelectedEmployee(employee);
    setShowNotificationModal(true);
  };

  const handleSendMessage = (employee) => {
    window.location.href = `/chat?userId=${employee.userId}`;
  };

  const handleApproveAttendance = (recordId, status) => {
    if (window.confirm(`Mark this attendance as ${status}?`)) {
      approveAttendanceMutation.mutate({ id: recordId, status });
    }
  };

  const roleLabels = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    supervisor: 'Supervisor',
    technician: 'Technician',
    customer: 'Customer'
  };

  const attendanceList = attendanceData?.attendance || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {userRole === 'super_admin' && 'Track employee attendance across all buildings'}
            {userRole === 'manager' && 'Track your team attendance'}
            {userRole === 'supervisor' && 'Track your technicians attendance'}
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statsData?.totalEmployees || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Present Today</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statsData?.present || 0}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {statsData?.attendanceRate || 0}% attendance rate
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statsData?.absent || 0}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late Arrivals</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statsData?.late || 0}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">On Leave</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statsData?.leave || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>
          
          {userRole === 'super_admin' && (
            <>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Building</label>
                <select 
                  value={selectedBuilding} 
                  onChange={(e) => setSelectedBuilding(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                >
                  <option value="all">All Buildings</option>
                  {buildingsData?.buildings?.map(building => (
                    <option key={building._id} value={building._id}>{building.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                >
                  <option value="all">All Roles</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="technician">Technician</option>
                </select>
              </div>
            </>
          )}
          
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="leave">On Leave</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
          </div>
          
          <button 
            onClick={() => {
              setSelectedBuilding('all');
              setSelectedRole('all');
              setSelectedStatus('all');
              setSearchTerm('');
              setSelectedDate(new Date().toISOString().split('T')[0]);
            }} 
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No attendance records found</td>
                </tr>
              ) : (
                attendanceList.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{record.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{record.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {roleLabels[record.role] || record.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {record.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.checkIn ? formatDateTime(record.checkIn) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.checkOut ? formatDateTime(record.checkOut) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.totalHours?.toFixed(1) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status?.toUpperCase() || 'ABSENT'}
                      </span>
                      {record.lateMinutes > 0 && (
                        <div className="text-xs text-yellow-600 mt-1">{record.lateMinutes} min late</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSendNotification(record)}
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                          title="Send Notification"
                        >
                          <BellIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleSendMessage(record)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400"
                          title="Send Message"
                        >
                          <ChatBubbleLeftIcon className="h-5 w-5" />
                        </button>
                        {(userRole === 'super_admin' || userRole === 'manager') && record.status === 'absent' && (
                          <button 
                            onClick={() => handleApproveAttendance(record._id, 'present')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Mark Present"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Notification Modal */}
      <Modal 
        isOpen={showNotificationModal} 
        onClose={() => {
          setShowNotificationModal(false);
          setNotificationMessage('');
          setSelectedEmployee(null);
        }} 
        title="Send Notification"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To: {selectedEmployee?.name} ({selectedEmployee?.email})
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              rows="4"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Type your notification message here..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowNotificationModal(false);
                setNotificationMessage('');
                setSelectedEmployee(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedEmployee && notificationMessage) {
                  sendNotificationMutation.mutate({
                    userId: selectedEmployee.userId,
                    title: 'Attendance Reminder',
                    message: notificationMessage,
                    type: 'attendance'
                  });
                } else {
                  toast.error('Please enter a message');
                }
              }}
              disabled={sendNotificationMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceMonitoring;