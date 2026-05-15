import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Line } from 'react-chartjs-2';
import complaintService from '../../services/complaint.service';

const SLAMonitoring = () => {
  const [period, setPeriod] = useState('week');

  const { data: slaData } = useQuery({
    queryKey: ['slaMetrics', period],
    queryFn: () => complaintService.getSLAReport({ period }),
  });

  const chartData = {
    labels: slaData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Response Time (hours)',
        data: slaData?.responseTimes || [2.5, 3.0, 2.8, 2.2, 2.9, 3.1, 2.4],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Resolution Time (hours)',
        data: slaData?.resolutionTimes || [24, 28, 22, 26, 30, 25, 23],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-900">SLA Monitoring</h1><p className="text-gray-600">Track service level agreement compliance</p></div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border rounded-lg"><option value="week">This Week</option><option value="month">This Month</option><option value="quarter">This Quarter</option></select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Overall Compliance</p><p className="text-2xl font-bold text-green-600">{slaData?.compliance || 94}%</p></div><div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center"><CheckCircleIcon className="h-6 w-6 text-green-600" /></div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Avg Response Time</p><p className="text-2xl font-bold">{slaData?.avgResponseTime || 2.6} hrs</p><p className="text-xs text-green-600 mt-1">Target: 4 hrs</p></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Avg Resolution Time</p><p className="text-2xl font-bold">{slaData?.avgResolutionTime || 25.4} hrs</p><p className="text-xs text-green-600 mt-1">Target: 48 hrs</p></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">SLA Breaches</p><p className="text-2xl font-bold text-red-600">{slaData?.breaches || 12}</p><p className="text-xs text-red-600 mt-1">↑ 3 vs last period</p></div></div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-lg font-semibold mb-4">SLA Performance Trend</h3><div className="h-80"><Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr>{['Priority', 'Target Response', 'Target Resolution', 'Actual Response', 'Actual Resolution', 'Compliance'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {slaData?.priorityMetrics?.map((metric, idx) => (<tr key={idx}><td className="px-6 py-4 capitalize">{metric.priority}</td><td className="px-6 py-4">{metric.targetResponse}h</td><td className="px-6 py-4">{metric.targetResolution}h</td><td className="px-6 py-4">{metric.actualResponse}h</td><td className="px-6 py-4">{metric.actualResolution}h</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${metric.compliance >= 90 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{metric.compliance}%</span></td></tr>))}
        </tbody></table></div>
    </div>
  );
};

export default SLAMonitoring;