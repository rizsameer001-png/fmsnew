import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import salaryConfigService from '../../services/salaryConfig.service';
import Modal from '../../components/common/Modal';

const SalaryConfig = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEarningModal, setShowEarningModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentType, setComponentType] = useState('earning');
  const [formData, setFormData] = useState({
    name: '',
    country: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    earnings: [],
    deductions: [],
    defaultBasicSalary: {
      super_admin: 80000,
      manager: 50000,
      supervisor: 35000,
      technician: 25000,
      customer: 0
    },
    settings: {
      enableAttendanceDeduction: true,
      dailyRateCalculation: 'working_days',
      roundOff: 'nearest',
      includeOverTime: false,
      overTimeRate: 1.5
    }
  });
  const [componentData, setComponentData] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: 0,
    basedOn: 'basic',
    isTaxable: true,
    isMandatory: true,
    maxAmount: null,
    description: ''
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

  const addEarningMutation = useMutation({
    mutationFn: ({ id, data }) => salaryConfigService.addEarningComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      setShowEarningModal(false);
      resetComponentData();
      toast.success('Earning component added');
      refetch();
    },
  });

  const updateEarningMutation = useMutation({
    mutationFn: ({ id, componentId, data }) => salaryConfigService.updateEarningComponent(id, componentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      setShowEarningModal(false);
      resetComponentData();
      toast.success('Earning component updated');
      refetch();
    },
  });

  const deleteEarningMutation = useMutation({
    mutationFn: ({ id, componentId }) => salaryConfigService.deleteEarningComponent(id, componentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      toast.success('Earning component deleted');
      refetch();
    },
  });

  const addDeductionMutation = useMutation({
    mutationFn: ({ id, data }) => salaryConfigService.addDeductionComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      setShowDeductionModal(false);
      resetComponentData();
      toast.success('Deduction component added');
      refetch();
    },
  });

  const updateDeductionMutation = useMutation({
    mutationFn: ({ id, componentId, data }) => salaryConfigService.updateDeductionComponent(id, componentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      setShowDeductionModal(false);
      resetComponentData();
      toast.success('Deduction component updated');
      refetch();
    },
  });

  const deleteDeductionMutation = useMutation({
    mutationFn: ({ id, componentId }) => salaryConfigService.deleteDeductionComponent(id, componentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['salaryConfigs']);
      toast.success('Deduction component deleted');
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
      defaultBasicSalary: {
        super_admin: 80000, manager: 50000, supervisor: 35000, technician: 25000, customer: 0
      },
      settings: {
        enableAttendanceDeduction: true, dailyRateCalculation: 'working_days',
        roundOff: 'nearest', includeOverTime: false, overTimeRate: 1.5
      }
    });
    setSelectedConfig(null);
  };

  const resetComponentData = () => {
    setComponentData({
      name: '', code: '', type: 'percentage', value: 0,
      basedOn: 'basic', isTaxable: true, isMandatory: true, maxAmount: null, description: ''
    });
    setSelectedComponent(null);
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

  const handleAddEarning = (config) => {
    setSelectedConfig(config);
    setComponentType('earning');
    resetComponentData();
    setShowEarningModal(true);
  };

  const handleEditEarning = (config, earning) => {
    setSelectedConfig(config);
    setSelectedComponent(earning);
    setComponentData(earning);
    setComponentType('earning');
    setShowEarningModal(true);
  };

  const handleDeleteEarning = (configId, componentId) => {
    if (window.confirm('Are you sure you want to delete this earning component?')) {
      deleteEarningMutation.mutate({ id: configId, componentId });
    }
  };

  const handleAddDeduction = (config) => {
    setSelectedConfig(config);
    setComponentType('deduction');
    resetComponentData();
    setShowDeductionModal(true);
  };

  const handleEditDeduction = (config, deduction) => {
    setSelectedConfig(config);
    setSelectedComponent(deduction);
    setComponentData(deduction);
    setComponentType('deduction');
    setShowDeductionModal(true);
  };

  const handleDeleteDeduction = (configId, componentId) => {
    if (window.confirm('Are you sure you want to delete this deduction component?')) {
      deleteDeductionMutation.mutate({ id: configId, componentId });
    }
  };

  const handleCreateDefault = () => {
    if (window.confirm('Create default configurations for India, UAE, and USA?')) {
      createDefaultMutation.mutate();
    }
  };

  const handleSubmitComponent = () => {
    if (!componentData.name) {
      toast.error('Please enter component name');
      return;
    }

    if (componentType === 'earning') {
      if (selectedComponent) {
        updateEarningMutation.mutate({
          id: selectedConfig._id,
          componentId: selectedComponent._id,
          data: componentData
        });
      } else {
        addEarningMutation.mutate({ id: selectedConfig._id, data: componentData });
      }
    } else {
      if (selectedComponent) {
        updateDeductionMutation.mutate({
          id: selectedConfig._id,
          componentId: selectedComponent._id,
          data: componentData
        });
      } else {
        addDeductionMutation.mutate({ id: selectedConfig._id, data: componentData });
      }
    }
  };

  const configs = configsData?.configs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure salary components dynamically for different countries
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => refetch()} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button onClick={handleCreateDefault} className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg">
            <PlusIcon className="h-5 w-5" />
            <span>Create Defaults</span>
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg">
            <PlusIcon className="h-5 w-5" />
            <span>Add Config</span>
          </button>
        </div>
      </div>

      {/* Configs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {configs.map((config) => (
          <div key={config._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* Config Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">{config.name}</h3>
                  <p className="text-indigo-100 text-sm">
                    {config.country} ({config.currencySymbol} {config.currency})
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(config)} className="p-1 text-white hover:text-indigo-200">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(config._id)} className="p-1 text-white hover:text-red-300">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Earnings Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                    Earnings Components
                  </h4>
                  <button
                    onClick={() => handleAddEarning(config)}
                    className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {config.earnings?.filter(e => e.isActive !== false).map((earning, idx) => (
                    <div key={earning._id || idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{earning.name}</p>
                        <p className="text-xs text-gray-500">
                          {earning.type === 'percentage' ? `${earning.value}% of ${earning.basedOn}` : `Fixed: ${config.currencySymbol}${earning.value}`}
                          {earning.isTaxable ? ' • Taxable' : ' • Non-Taxable'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditEarning(config, earning)} className="text-blue-600 hover:text-blue-800">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteEarning(config._id, earning._id)} className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!config.earnings || config.earnings.length === 0) && (
                    <p className="text-gray-500 text-sm text-center py-4">No earnings components configured</p>
                  )}
                </div>
              </div>

              {/* Deductions Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center">
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    Deductions Components
                  </h4>
                  <button
                    onClick={() => handleAddDeduction(config)}
                    className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {config.deductions?.filter(d => d.isActive !== false).map((deduction, idx) => (
                    <div key={deduction._id || idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{deduction.name}</p>
                        <p className="text-xs text-gray-500">
                          {deduction.type === 'percentage' ? `${deduction.value}% of ${deduction.basedOn}` : `Fixed: ${config.currencySymbol}${deduction.value}`}
                          {deduction.maxAmount && ` • Max: ${config.currencySymbol}${deduction.maxAmount}`}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditDeduction(config, deduction)} className="text-blue-600 hover:text-blue-800">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteDeduction(config._id, deduction._id)} className="text-red-600 hover:text-red-800">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!config.deductions || config.deductions.length === 0) && (
                    <p className="text-gray-500 text-sm text-center py-4">No deductions components configured</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500">No salary configurations found</p>
          <button onClick={handleCreateDefault} className="mt-4 text-indigo-600 hover:text-indigo-700">
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
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Config Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country *</label>
              <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="India">India</option><option value="UAE">UAE</option><option value="USA">USA</option>
                <option value="Saudi Arabia">Saudi Arabia</option><option value="UK">UK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <input type="text" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency Symbol</label>
              <input type="text" value={formData.currencySymbol} onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Earning Component Modal */}
      <Modal isOpen={showEarningModal} onClose={() => { setShowEarningModal(false); resetComponentData(); }} title={`${selectedComponent ? 'Edit' : 'Add'} Earning Component`} size="md">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitComponent(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Component Name *</label>
            <input type="text" required value={componentData.name} onChange={(e) => setComponentData({ ...componentData, name: e.target.value, code: e.target.value.toUpperCase().replace(/\s/g, '_') })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={componentData.type} onChange={(e) => setComponentData({ ...componentData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="percentage">Percentage of Basic</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input type="number" value={componentData.value} onChange={(e) => setComponentData({ ...componentData, value: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={componentData.isTaxable} onChange={(e) => setComponentData({ ...componentData, isTaxable: e.target.checked })} className="rounded" />
              <span>Taxable</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => { setShowEarningModal(false); resetComponentData(); }} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </Modal>

      {/* Add/Edit Deduction Component Modal */}
      <Modal isOpen={showDeductionModal} onClose={() => { setShowDeductionModal(false); resetComponentData(); }} title={`${selectedComponent ? 'Edit' : 'Add'} Deduction Component`} size="md">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitComponent(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Component Name *</label>
            <input type="text" required value={componentData.name} onChange={(e) => setComponentData({ ...componentData, name: e.target.value, code: e.target.value.toUpperCase().replace(/\s/g, '_') })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={componentData.type} onChange={(e) => setComponentData({ ...componentData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="percentage">Percentage of Basic</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input type="number" value={componentData.value} onChange={(e) => setComponentData({ ...componentData, value: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Amount (Optional)</label>
            <input type="number" value={componentData.maxAmount || ''} onChange={(e) => setComponentData({ ...componentData, maxAmount: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={componentData.isMandatory} onChange={(e) => setComponentData({ ...componentData, isMandatory: e.target.checked })} className="rounded" />
              <span>Mandatory</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => { setShowDeductionModal(false); resetComponentData(); }} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalaryConfig;