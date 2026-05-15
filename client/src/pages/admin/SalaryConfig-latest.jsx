import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import salaryConfigService from '../../services/salaryConfig.service';
import Modal from '../../components/common/Modal';

const SalaryConfig = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    earnings: [],
    deductions: [],
    defaultBasicSalary: {},
    settings: {}
  });

  const queryClient = useQueryClient();

  const { data: configsData, isLoading, refetch } = useQuery({
    queryKey: ['salaryConfigs'],
    queryFn: () => salaryConfigService.getSalaryConfigs(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => salaryConfigService.createSalaryConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      setShowModal(false);
      resetForm();
      toast.success('Salary configuration created');
      refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => salaryConfigService.updateSalaryConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      setShowModal(false);
      resetForm();
      toast.success('Salary configuration updated');
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => salaryConfigService.deleteSalaryConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      toast.success('Salary configuration deleted');
      refetch();
    },
  });

  const createDefaultMutation = useMutation({
    mutationFn: () => salaryConfigService.createDefaultConfigs(),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      toast.success('Default configurations created');
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      country: 'India',
      currency: 'INR',
      currencySymbol: '₹',
      earnings: [],
      deductions: [],
      defaultBasicSalary: {},
      settings: {}
    });
    setSelectedConfig(null);
  };

  const handleEdit = (config) => {
    setSelectedConfig(config);
    setFormData(config);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this salary configuration?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateDefault = () => {
    if (window.confirm('Create default configurations for India, UAE, and USA?')) {
      createDefaultMutation.mutate();
    }
  };

  const configs = configsData?.configs || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure salary components for different countries (India, UAE, USA)
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCreateDefault}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Defaults</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Config</span>
          </button>
        </div>
      </div>

      {/* Configs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.map((config) => (
          <div key={config._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{config.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {config.country} ({config.currencySymbol} {config.currency})
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(config)} className="text-blue-600 hover:text-blue-800">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(config._id)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Earnings Components</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.earnings?.map((earning, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                      {earning.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Deductions Components</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.deductions?.map((deduction, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                      {deduction.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Default Basic: {config.currencySymbol}
                  {config.defaultBasicSalary?.technician?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500">No salary configurations found</p>
          <button
            onClick={handleCreateDefault}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Create default configurations
          </button>
        </div>
      )}

      {/* Add/Edit Config Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedConfig ? 'Edit Salary Config' : 'Add Salary Config'} size="lg">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (selectedConfig) {
            updateMutation.mutate({ id: selectedConfig._id, data: formData });
          } else {
            createMutation.mutate(formData);
          }
        }} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Config Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Indian Salary Structure"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="India">India</option>
                <option value="UAE">UAE</option>
                <option value="USA">USA</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="UK">UK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="INR, USD, AED"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="₹, $, د.إ"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalaryConfig;