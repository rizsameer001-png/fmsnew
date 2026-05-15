import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserGroupIcon, ClipboardDocumentCheckIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import dashboardService from '../../services/dashboard.service';
import StatsCard from '../../components/dashboard/StatsCard';

const SupervisorDashboard = () => {
  const { data: stats } = useQuery({ queryKey: ['supervisorDashboard'], queryFn: () => dashboardService.getSupervisorStats() });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1><p className="text-gray-600">Monitor your team's performance and field operations</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Team Members" value={stats?.teamSize || 8} icon={<UserGroupIcon className="h-8 w-8 text-blue-600" />} color="blue" />
        <StatsCard title="Active Tasks" value={stats?.activeTasks || 12} icon={<ClipboardDocumentCheckIcon className="h-8 w-8 text-yellow-600" />} color="yellow" />
        <StatsCard title="Today's Attendance" value={`${stats?.attendedToday || 6}/${stats?.teamSize || 8}`} icon={<ClockIcon className="h-8 w-8 text-green-600" />} color="green" />
        <StatsCard title="Completed Today" value={stats?.completedToday || 8} icon={<CheckCircleIcon className="h-8 w-8 text-purple-600" />} color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{/* Field staff status and recent activities */}</div>
    </div>
  );
};

export default SupervisorDashboard;