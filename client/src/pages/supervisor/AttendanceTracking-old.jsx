import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import attendanceService from '../../services/attendance.service';
import { formatDate, formatTime } from '../../utils/formatters';

const AttendanceTracking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: attendanceData, refetch } = useQuery({
    queryKey: ['teamAttendance', selectedDate],
    queryFn: () => attendanceService.getTeamAttendance({ date: selectedDate }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status, notes }) => attendanceService.approveAttendance(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamAttendance']);
      toast.success('Attendance updated');
    },
  });

  const stats = {
    present: attendanceData?.attendance?.filter(a => a.status === 'present').length || 0,
    absent: attendanceData?.attendance?.filter(a => a.status === 'absent').length || 0,
    late: attendanceData?.attendance?.filter(a => a.status === 'late').length || 0,
    onLeave: attendanceData?.attendance?.filter(a => a.status === 'leave').length || 0,
    total: attendanceData?.attendance?.length || 0,
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      leave: 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-900">Team Attendance Tracking</h1><p className="text-gray-600">Monitor daily attendance and punctuality</p></div>
        <div className="flex space-x-3"><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border rounded-lg" /><button onClick={() => refetch()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Refresh</button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Staff</p><p className="text-2xl font-bold">{stats.total}</p></div><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><UserGroupIcon className="h-6 w-6 text-blue-600" /></div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Present</p><p className="text-2xl font-bold text-green-600">{stats.present}</p><div className="mt-2 text-sm text-gray-500">{((stats.present / stats.total) * 100).toFixed(1)}% attendance</div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Late Arrivals</p><p className="text-2xl font-bold text-yellow-600">{stats.late}</p></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Absent / Leave</p><p className="text-2xl font-bold text-red-600">{stats.absent + stats.onLeave}</p></div></div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData?.attendance?.map((record) => (
              <tr key={record._id}>
                <td className="px-6 py-4"><div className="font-medium text-gray-900">{record.userId?.name}</div><div className="text-xs text-gray-500">{record.userId?.email}</div></td>
                <td className="px-6 py-4 capitalize">{record.userId?.role}</td>
                <td className="px-6 py-4">{record.checkIn?.time ? formatTime(record.checkIn.time) : '-'}</td>
                <td className="px-6 py-4">{record.checkOut?.time ? formatTime(record.checkOut.time) : '-'}</td>
                <td className="px-6 py-4">{record.totalHours?.toFixed(1) || '-'}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}>{record.status?.toUpperCase()}</span></td>
                <td className="px-6 py-4">
                  {record.status === 'late' && (<button onClick={() => approveMutation.mutate({ id: record._id, status: 'present', notes: 'Approved by supervisor' })} className="text-green-600 hover:text-green-800 text-sm">Approve</button>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTracking;