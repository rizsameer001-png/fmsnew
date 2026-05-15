import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BuildingOfficeIcon, ChartBarIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import dashboardService from '../../services/dashboard.service';

const BuildingPerformance = () => {
  const { data: metrics } = useQuery({ queryKey: ['buildingMetrics'], queryFn: () => dashboardService.getBuildingMetrics() });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Building Performance</h1><p className="text-gray-600">Monitor key metrics across all buildings</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{metrics?.buildings?.map((building, idx) => (<div key={idx} className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">{building.name}</h3><span className={`px-2 py-1 rounded-full text-xs font-semibold ${building.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{building.status}</span></div><div className="space-y-3"><div className="flex items-center justify-between"><div className="flex items-center"><BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" /><span className="text-sm">Floors</span></div><span className="font-medium">{building.totalFloors}</span></div><div className="flex items-center justify-between"><div className="flex items-center"><ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400 mr-2" /><span className="text-sm">Open Complaints</span></div><span className="font-medium text-red-600">{building.openComplaints}</span></div><div className="flex items-center justify-between"><div className="flex items-center"><ClockIcon className="h-4 w-4 text-gray-400 mr-2" /><span className="text-sm">Avg Response</span></div><span className="font-medium">{building.avgResponseTime} hrs</span></div><div className="mt-4"><div className="flex justify-between text-sm mb-1"><span>SLA Compliance</span><span>{building.slaCompliance}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: `${building.slaCompliance}%` }}></div></div></div></div></div>))}</div>
    </div>
  );
};

export default BuildingPerformance;