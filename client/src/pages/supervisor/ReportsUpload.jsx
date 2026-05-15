import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import reportService from '../../services/report.service';

const ReportsUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportType, setReportType] = useState('daily');

  const { data: reports, refetch } = useQuery({
    queryKey: ['uploadedReports'],
    queryFn: () => reportService.getUploadedReports(),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => reportService.uploadReport(formData),
    onSuccess: () => {
      refetch();
      toast.success('Report uploaded successfully');
      setSelectedFile(null);
    },
  });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', reportType);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Reports Upload</h1><p className="text-gray-600">Upload daily reports and documents</p></div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label><select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-3 py-2 border rounded-lg"><option value="daily">Daily Report</option><option value="weekly">Weekly Report</option><option value="monthly">Monthly Report</option><option value="incident">Incident Report</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Select File</label><input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xlsx,.jpg,.png" className="w-full" /></div>
          <div><button onClick={handleUpload} disabled={uploadMutation.isPending} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"><CloudArrowUpIcon className="h-5 w-5" /><span>{uploadMutation.isPending ? 'Uploading...' : 'Upload Report'}</span></button></div>
        </div>
        {selectedFile && <p className="mt-3 text-sm text-green-600">Selected: {selectedFile.name}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6"><h3 className="text-lg font-semibold mb-4">Recent Uploads</h3><div className="space-y-3">{reports?.slice(0, 10).map((report) => (<div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center space-x-3"><DocumentTextIcon className="h-8 w-8 text-gray-400" /><div><p className="font-medium text-gray-900">{report.name}</p><p className="text-xs text-gray-500">Uploaded: {new Date(report.uploadedAt).toLocaleString()} • {report.size}</p></div></div><div className="flex space-x-2"><button className="p-1 text-blue-600"><EyeIcon className="h-5 w-5" /></button><button className="p-1 text-red-600"><TrashIcon className="h-5 w-5" /></button></div></div>))}</div></div>
    </div>
  );
};

export default ReportsUpload;