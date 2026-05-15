import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, XMarkIcon,
  HomeIcon, UsersIcon, ClipboardDocumentListIcon,
  ChartBarIcon, CalendarIcon, CheckBadgeIcon,
  UserGroupIcon, ClockIcon, DocumentTextIcon,
  BellIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { getInitials } from '../utils/formatters';

const ManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/manager/dashboard', icon: HomeIcon },
    { name: 'My Attendance', href: '/admin/my-attendance', icon: ClockIcon },  // ✅ ADDED
    { name: 'Supervisor Management', href: '/manager/supervisors', icon: UsersIcon },
    { name: 'Technician Assignment', href: '/manager/technicians', icon: UserGroupIcon },
    { name: 'Complaint Monitoring', href: '/manager/complaints', icon: ClipboardDocumentListIcon },
    { name: 'SLA Monitoring', href: '/manager/sla', icon: CheckBadgeIcon },
    { name: 'Team Attendance', href: '/manager/attendance', icon: ClockIcon },
    { name: 'Work Scheduling', href: '/manager/scheduling', icon: CalendarIcon },
    { name: 'Approvals', href: '/manager/approvals', icon: DocumentTextIcon },
    { name: 'Reports', href: '/manager/reports', icon: ChartBarIcon },
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
        <div className="relative flex flex-col flex-1 w-64 bg-blue-700">
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
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                  <Bars3Icon className="h-6 w-6 text-gray-600" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">Manager Panel</h1>
                  <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">{getInitials(user?.name)}</span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                      <button onClick={() => navigate('/manager/profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <UserCircleIcon className="h-4 w-4 inline mr-2" /> Profile
                      </button>
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                        <ArrowRightOnRectangleIcon className="h-4 w-4 inline mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation }) => {
  const navigate = useNavigate();
  const location = window.location.pathname;

  return (
    <div className="flex flex-col flex-1 bg-blue-700">
      <div className="flex items-center justify-center h-16 bg-blue-800">
        <h1 className="text-white text-xl font-bold">FMS Manager</h1>
      </div>
      <nav className="flex-1 mt-5 px-2 space-y-1">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.href)}
            className={`group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              location === item.href
                ? 'bg-blue-800 text-white'
                : 'text-blue-100 hover:bg-blue-600'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ManagerLayout;