//client/src/pages/admin/AttendanceMonitoring.jsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, UserGroupIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import attendanceService from '../../services/attendance.service';
import { formatDate, formatDateTime } from '../../utils/formatters';

const AttendanceMonitoring = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBuilding, setSelectedBuilding] = useState('all');

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', selectedDate, selectedBuilding],
    queryFn: () => attendanceService.getAttendanceReport({ date: selectedDate, buildingId: selectedBuilding !== 'all' ? selectedBuilding : undefined }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['attendanceStats', selectedDate],
    queryFn: () => attendanceService.getAttendanceStats({ date: selectedDate }),
  });

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      half_day: 'bg-orange-100 text-orange-800',
      holiday: 'bg-purple-100 text-purple-800',
      leave: 'bg-blue-100 text-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Monitoring</h1>
          <p className="text-gray-600 mt-1">Track employee attendance across all buildings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Employees</p><p className="text-2xl font-bold">{statsData?.totalEmployees || 0}</p></div><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><UserGroupIcon className="h-6 w-6 text-blue-600" /></div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Present Today</p><p className="text-2xl font-bold text-green-600">{statsData?.present || 0}</p></div><div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center"><CheckCircleIcon className="h-6 w-6 text-green-600" /></div></div><div className="mt-2 text-sm text-gray-500">{((statsData?.present / statsData?.totalEmployees) * 100).toFixed(1)}% attendance rate</div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Absent</p><p className="text-2xl font-bold text-red-600">{statsData?.absent || 0}</p></div><div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center"><XCircleIcon className="h-6 w-6 text-red-600" /></div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Late Arrivals</p><p className="text-2xl font-bold text-yellow-600">{statsData?.late || 0}</p></div><div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center"><ClockIcon className="h-6 w-6 text-yellow-600" /></div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">On Leave</p><p className="text-2xl font-bold text-blue-600">{statsData?.leave || 0}</p></div><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><CalendarIcon className="h-6 w-6 text-blue-600" /></div></div></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex gap-4 items-end">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Building</label><select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg"><option value="all">All Buildings</option></select></div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>{['Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Status', 'Late Minutes'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData?.report?.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{record.name}</div><div className="text-sm text-gray-500">{record.email}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.department || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkIn ? formatDateTime(record.checkIn) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.checkOut ? formatDateTime(record.checkOut) : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.totalHours?.toFixed(1) || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}>{record.status?.toUpperCase() || 'ABSENT'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.lateMinutes ? `${record.lateMinutes} min` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMonitoring;