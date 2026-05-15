import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  FlagIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
   UserGroupIcon,           // ⬅️ ADD THIS - was missing
   ChartBarIcon,        // ⬅️ ADD THIS - was missing
  ExclamationTriangleIcon  // ⬅️ ADD THIS - for emergency (optional)
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../hooks/useTheme';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';

const SupervisorLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/supervisor/dashboard', icon: HomeIcon },
    { name: 'My Attendance', href: '/admin/my-attendance', icon: ClockIcon },  // ✅ ADDED
    { name: 'Technician Assignment', href: '/supervisor/technicians', icon: UserGroupIcon },  // ⬅️ This should be correct
    { name: 'Field Staff', href: '/supervisor/field-staff', icon: UsersIcon },
    // { name: 'Task Assignment', href: '/supervisor/technicians', icon: ClipboardDocumentCheckIcon },
    { name: 'Complaint Handling', href: '/supervisor/complaints', icon: ChatBubbleLeftRightIcon },
    { name: 'Work Verification', href: '/supervisor/verification', icon: DocumentDuplicateIcon },
    { name: 'Attendance Tracking', href: '/supervisor/attendance', icon: ClockIcon },
    { name: 'Site Inspection', href: '/supervisor/inspection', icon: MapPinIcon },
    { name: 'Escalate Issues', href: '/supervisor/escalate', icon: FlagIcon },
    { name: 'Reports', href: '/supervisor/reports', icon: ChartBarIcon },  // ⬅️ ADD THIS
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <MobileNav 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        navigation={navigation}
        role="supervisor"
      />

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar navigation={navigation} role="supervisor" />
      </div>

      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileMenuOpen(true)} role="supervisor" />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout;