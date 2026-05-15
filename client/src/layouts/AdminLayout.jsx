import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarDaysIcon,  // ✅ Use this instead of CalendarIcon and BriefcaseIcon // ← for Leave Management alternative
  CurrencyRupeeIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { getInitials } from '../utils/formatters';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'My Attendance', href: '/admin/my-attendance', icon: ClockIcon },  // ✅ ADDED - Admin's own attendance
    { name: 'My Salary', href: '/admin/my-salary', icon: CurrencyRupeeIcon },  // ✅ ADDED
    { name: 'User Management', href: '/admin/users', icon: UsersIcon },
    { name: 'Building Management', href: '/admin/buildings', icon: BuildingOfficeIcon },
    { name: 'Role Management', href: '/admin/roles', icon: ShieldCheckIcon },
    { name: 'Complaint Monitoring', href: '/admin/complaints', icon: ChatBubbleLeftRightIcon },
    { name: 'Attendance Monitoring', href: '/admin/attendance', icon: ClockIcon },
    { name: 'Leave Management', href: '/admin/leaves', icon: CalendarDaysIcon },
    { name: 'Salary Management', href: '/admin/salary', icon: CurrencyRupeeIcon }, // ✅ ADDED
    // Add to navigation array (after Salary Management)
    { name: 'Salary Config', href: '/admin/salary-config', icon: CogIcon },
    { name: 'GPS Tracking', href: '/admin/gps-tracking', icon: MapPinIcon },
    { name: 'Billing Control', href: '/admin/billing', icon: CreditCardIcon },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: ChartBarIcon },
    { name: 'Activity Logs', href: '/admin/activity-logs', icon: DocumentTextIcon },
    { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex flex-col flex-1 w-64 bg-indigo-700">
          <div className="absolute top-0 right-0 p-2">
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <SidebarContent navigation={navigation} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <SidebarContent navigation={navigation} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                  <Bars3Icon className="h-6 w-6 text-gray-600" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {getInitials(user?.name)}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                      <button
                        onClick={() => navigate('/admin/profile')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserCircleIcon className="h-4 w-4 inline mr-2" />
                        Your Profile
                      </button>
                      <button
                        onClick={() => navigate('/admin/settings')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
                        Settings
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Sidebar Content Component
const SidebarContent = ({ navigation }) => {
  const navigate = useNavigate();
  const location = window.location.pathname;

  return (
    <div className="flex flex-col flex-1 bg-indigo-700">
      <div className="flex items-center justify-center h-16 bg-indigo-800">
        <h1 className="text-white text-xl font-bold">FMS Admin</h1>
      </div>
      <nav className="flex-1 mt-5 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
              }`} />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminLayout;