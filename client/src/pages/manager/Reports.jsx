import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import reportService from '../../services/report.service';
import { formatCurrency } from '../../utils/formatters';

const Reports = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('performance');

  const { data: reportData } = useQuery({ queryKey: ['managerReports', reportType, dateRange], queryFn: () => reportService.getPerformanceReport(dateRange) });

  const exportReport = (format) => { reportService.exportReport({ ...dateRange, type: reportType, format }); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-gray-600">Generate and export performance reports</p></div><div className="flex space-x-2"><button onClick={() => exportReport('excel')} className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg"><DocumentArrowDownIcon className="h-4 w-4" /><span>Excel</span></button><button onClick={() => exportReport('pdf')} className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg"><DocumentArrowDownIcon className="h-4 w-4" /><span>PDF</span></button></div></div>

      <div className="bg-white rounded-xl shadow-md p-4 flex gap-4"><div><label className="block text-sm font-medium mb-1">Start Date</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="px-3 py-2 border rounded-lg" /></div><select value={reportType} onChange={(e) => setReportType(e.target.value)} className="px-3 py-2 border rounded-lg"><option value="performance">Performance Report</option><option value="attendance">Attendance Report</option><option value="complaints">Complaints Report</option></select></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-lg font-semibold mb-4">Team Performance</h3><div className="space-y-3">{reportData?.performance?.map((tech, idx) => (<div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{tech.name}</p><p className="text-sm text-gray-500 capitalize">{tech.role}</p></div><div className="text-right"><p className="font-bold text-indigo-600">{tech.completedTasks} tasks</p><p className="text-sm text-gray-500">⭐ {tech.rating}/5</p></div></div>))}</div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-lg font-semibold mb-4">Summary</h3><div className="space-y-4"><div className="flex justify-between p-3 bg-green-50 rounded-lg"><span>Total Tasks Completed</span><span className="font-bold">{reportData?.totalTasks || 0}</span></div><div className="flex justify-between p-3 bg-blue-50 rounded-lg"><span>Avg Response Time</span><span className="font-bold">{reportData?.avgResponseTime || 2.4} hrs</span></div><div className="flex justify-between p-3 bg-yellow-50 rounded-lg"><span>SLA Compliance</span><span className="font-bold">{reportData?.slaCompliance || 94}%</span></div><div className="flex justify-between p-3 bg-purple-50 rounded-lg"><span>Customer Rating</span><span className="font-bold">{reportData?.avgRating || 4.6}/5</span></div></div></div></div>
    </div>
  );
};

export default Reports;