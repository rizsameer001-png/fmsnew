import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentCheckIcon, ArrowPathIcon, GlobeAltIcon, BellIcon, ShieldCheckIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

import { toast } from 'react-hot-toast';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: { companyName: 'FMS Solutions', companyEmail: 'info@fms.com', companyPhone: '+91 98765 43210', address: '123 Business Park, Mumbai', timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY' },
    notifications: { emailNotifications: true, pushNotifications: true, smsNotifications: false, complaintAssigned: true, taskAssigned: true, paymentReceived: true, attendanceReminder: true },
    security: { twoFactorAuth: false, sessionTimeout: 30, passwordExpiryDays: 90, maxLoginAttempts: 5 },
    appearance: { primaryColor: '#4F46E5', logoUrl: '', faviconUrl: '', darkMode: false },
  });

  const updateMutation = useMutation({ mutationFn: (data) => fetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(res => res.json()), onSuccess: () => toast.success('Settings saved'), onError: () => toast.error('Failed to save settings') });

  const tabs = [{ id: 'general', name: 'General', icon: GlobeAltIcon }, { id: 'notifications', name: 'Notifications', icon: BellIcon }, { id: 'security', name: 'Security', icon: ShieldCheckIcon }, { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon }];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">System Settings</h1><p className="text-gray-600">Configure system-wide settings and preferences</p></div><button onClick={() => updateMutation.mutate(settings)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><DocumentCheckIcon className="h-5 w-5" /><span>Save Changes</span></button></div>

      <div className="flex space-x-1 border-b bg-white rounded-t-xl px-4">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}><tab.icon className="h-4 w-4" /><span>{tab.name}</span></button>))}</div>

      <div className="bg-white rounded-b-xl shadow-md p-6">
        {activeTab === 'general' && (<div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label><input type="text" value={settings.general.companyName} onChange={(e) => setSettings({ ...settings, general: { ...settings.general, companyName: e.target.value } })} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label><input type="email" value={settings.general.companyEmail} onChange={(e) => setSettings({ ...settings, general: { ...settings.general, companyEmail: e.target.value } })} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={settings.general.companyPhone} onChange={(e) => setSettings({ ...settings, general: { ...settings.general, companyPhone: e.target.value } })} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label><select value={settings.general.timezone} onChange={(e) => setSettings({ ...settings, general: { ...settings.general, timezone: e.target.value } })} className="w-full px-3 py-2 border rounded-lg"><option value="Asia/Kolkata">IST (Asia/Kolkata)</option><option value="Asia/Dubai">GST (Asia/Dubai)</option><option value="America/New_York">EST (America/New_York)</option></select></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea rows={2} value={settings.general.address} onChange={(e) => setSettings({ ...settings, general: { ...settings.general, address: e.target.value } })} className="w-full px-3 py-2 border rounded-lg" /></div></div>)}

        {activeTab === 'notifications' && (<div className="space-y-4"><div className="space-y-2">{Object.entries(settings.notifications).map(([key, value]) => (<label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span><input type="checkbox" checked={value} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, [key]: e.target.checked } })} className="toggle" /></label>))}</div></div>)}

        {activeTab === 'security' && (<div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label><input type="number" value={settings.security.sessionTimeout} onChange={(e) => setSettings({ ...settings, security: { ...settings.security, sessionTimeout: parseInt(e.target.value) } })} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label><input type="number" value={settings.security.passwordExpiryDays} onChange={(e) => setSettings({ ...settings, security: { ...settings.security, passwordExpiryDays: parseInt(e.target.value) } })} className="w-full px-3 py-2 border rounded-lg" /></div></div><div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-700">Two-Factor Authentication</span><input type="checkbox" checked={settings.security.twoFactorAuth} onChange={(e) => setSettings({ ...settings, security: { ...settings.security, twoFactorAuth: e.target.checked } })} className="toggle" /></div></div>)}

        {activeTab === 'appearance' && (<div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label><input type="color" value={settings.appearance.primaryColor} onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, primaryColor: e.target.value } })} className="w-20 h-10 border rounded" /></div><div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-700">Dark Mode</span><input type="checkbox" checked={settings.appearance.darkMode} onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, darkMode: e.target.checked } })} className="toggle" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label><input type="text" value={settings.appearance.logoUrl} onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, logoUrl: e.target.value } })} placeholder="/uploads/logo.png" className="w-full px-3 py-2 border rounded-lg" /></div></div>)}
      </div>
    </div>
  );
};

export default SystemSettings;