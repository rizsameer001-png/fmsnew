import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import attendanceService from '../../services/attendance.service';
import { formatDate } from '../../utils/formatters';

const TeamAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: attendanceData } = useQuery({
    queryKey: ['teamAttendance', selectedDate],
    queryFn: () => attendanceService.getTeamAttendance({ date: selectedDate }),
  });

  const stats = {
    present: attendanceData?.attendance?.filter(a => a.status === 'present').length || 0,
    absent: attendanceData?.attendance?.filter(a => a.status === 'absent').length || 0,
    late: attendanceData?.attendance?.filter(a => a.status === 'late').length || 0,
    onLeave: attendanceData?.attendance?.filter(a => a.status === 'leave').length || 0,
    total: attendanceData?.attendance?.length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Team Attendance</h1><p className="text-gray-600">Monitor team attendance and punctuality</p></div>
        <div><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-2 border rounded-lg" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Staff</p><p className="text-2xl font-bold">{stats.total}</p></div><div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center"><UserGroupIcon className="h-6 w-6 text-blue-600" /></div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Present</p><p className="text-2xl font-bold text-green-600">{stats.present}</p><div className="mt-2 text-sm text-gray-500">{((stats.present / stats.total) * 100).toFixed(1)}% attendance</div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Late Arrivals</p><p className="text-2xl font-bold text-yellow-600">{stats.late}</p></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Absent / Leave</p><p className="text-2xl font-bold text-red-600">{stats.absent + stats.onLeave}</p></div></div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Employee', 'Role', 'Check In', 'Check Out', 'Hours', 'Status', 'Late'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
        <tbody className="bg-white divide-y divide-gray-200">{attendanceData?.attendance?.map((record, idx) => (<tr key={idx}><td className="px-6 py-4"><div className="font-medium text-gray-900">{record.userId?.name}</div><div className="text-xs text-gray-500">{record.userId?.email}</div></td><td className="px-6 py-4 capitalize">{record.userId?.role}</td><td className="px-6 py-4">{record.checkIn?.time ? formatDate(record.checkIn.time, 'HH:mm') : '-'}</td><td className="px-6 py-4">{record.checkOut?.time ? formatDate(record.checkOut.time, 'HH:mm') : '-'}</td><td className="px-6 py-4">{record.totalHours?.toFixed(1) || '-'}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'present' ? 'bg-green-100 text-green-800' : record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{record.status}</span></td><td className="px-6 py-4">{record.lateMinutes ? `${record.lateMinutes} min` : '-'}</td></tr>))}</tbody></table></div>
    </div>
  );
};

export default TeamAttendance;