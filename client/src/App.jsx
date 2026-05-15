// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './hooks/useAuth';
// import { LoadingSpinner } from './components/common/Loader';

// // Layouts
// import AdminLayout from './layouts/AdminLayout';
// import ManagerLayout from './layouts/ManagerLayout';
// import SupervisorLayout from './layouts/SupervisorLayout';
// import TechnicianLayout from './layouts/TechnicianLayout';
// import CustomerLayout from './layouts/CustomerLayout';
// import PublicLayout from './layouts/PublicLayout';

// // Auth Pages
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
// import ForgotPassword from './pages/auth/ForgotPassword';
// import ResetPassword from './pages/auth/ResetPassword';
// import VerifyOTP from './pages/auth/VerifyOTP';

// // Add import common Attendance for all emp
// import MyAttendance from './pages/employee/MyAttendance';

// // Admin Pages
// import AdminDashboard from './pages/admin/Dashboard';
// import UserManagement from './pages/admin/UserManagement';
// import BuildingManagement from './pages/admin/BuildingManagement';
// import RoleManagement from './pages/admin/RoleManagement';
// import ComplaintMonitoring from './pages/admin/ComplaintMonitoring';
// import AttendanceMonitoring from './pages/admin/AttendanceMonitoring';
// import LeaveManagement from './pages/admin/LeaveManagement';  // ✅ ADD THIS
// import AdminGPSTracking from './pages/admin/GPSTracking';
// import BillingControl from './pages/admin/BillingControl';
// import ReportsAnalytics from './pages/admin/ReportsAnalytics';
// import SystemSettings from './pages/admin/SystemSettings';
// import ActivityLogs from './pages/admin/ActivityLogs';
// import ApprovalManagement from './pages/admin/ApprovalManagement';

// // Manager Pages
// import ManagerDashboard from './pages/manager/Dashboard';
// import SupervisorManagement from './pages/manager/SupervisorManagement';
// import TechnicianAssignment from './pages/manager/TechnicianAssignment';
// import SLAMonitoring from './pages/manager/SLAMonitoring';
// import TeamAttendance from './pages/manager/TeamAttendance';
// import WorkScheduling from './pages/manager/WorkScheduling';
// import Approvals from './pages/manager/Approvals';
// import ManagerReports from './pages/manager/Reports';
// import BuildingPerformance from './pages/manager/BuildingPerformance';

// // Supervisor Pages
// import SupervisorDashboard from './pages/supervisor/Dashboard';
// import FieldStaffMonitoring from './pages/supervisor/FieldStaffMonitoring';
// import WorkVerification from './pages/supervisor/WorkVerification';
// import ComplaintHandling from './pages/supervisor/ComplaintHandling';
// import SiteInspection from './pages/supervisor/SiteInspection';
// import AttendanceTracking from './pages/supervisor/AttendanceTracking';
// import EscalateIssues from './pages/supervisor/EscalateIssues';
// import TeamCommunication from './pages/supervisor/TeamCommunication';
// import SupervisorTechnicianAssignment from './pages/supervisor/TechnicianAssignment';  // ⬅️ Renamed to avoid conflict
// import SupervisorReports from './pages/supervisor/Reports';

// // Technician Pages
// import TechnicianDashboard from './pages/technician/Dashboard';
// import MyTasks from './pages/technician/MyTasks';
// import TaskDetails from './pages/technician/TaskDetails';
// import TechnicianAttendance from './pages/technician/Attendance';
// import TechnicianNotifications from './pages/technician/Notifications';
// import EmergencyAlert from './pages/technician/EmergencyAlert';
// import MyReports from './pages/technician/MyReports';
// import TechnicianProfile from './pages/technician/Profile';
// import TechnicianGPSTracking from './pages/technician/GPSTracking';  // ⬅️ UNCOMMENTED

// // Customer Pages
// import CustomerDashboard from './pages/customer/Dashboard';
// import RaiseComplaint from './pages/customer/RaiseComplaint';
// import RequestService from './pages/customer/RequestService';
// import ComplaintStatus from './pages/customer/ComplaintStatus';
// import CustomerInvoices from './pages/customer/Invoices';
// import PaymentHistory from './pages/customer/PaymentHistory';
// import ChatSupport from './pages/customer/ChatSupport';
// import ServiceHistory from './pages/customer/ServiceHistory';
// import CustomerProfile from './pages/customer/Profile';

// // Public Pages
// import Homepage from './pages/public/Homepage';
// import Services from './pages/public/Services';
// import AboutUs from './pages/public/AboutUs';
// import Contact from './pages/public/Contact';
// import Testimonials from './pages/public/Testimonials';
// import Pricing from './pages/public/Pricing';

// // Protected Route Component
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { user, isLoading } = useAuth();
  
//   if (isLoading) {
//     return <LoadingSpinner />;
//   }
  
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
  
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     // Redirect to appropriate dashboard based on role
//     const roleRoutes = {
//       super_admin: '/admin/dashboard',
//       manager: '/manager/dashboard',
//       supervisor: '/supervisor/dashboard',
//       technician: '/technician/dashboard',
//       customer: '/customer/dashboard',
//     };
//     return <Navigate to={roleRoutes[user.role] || '/'} replace />;
//   }
  
//   return children;
// };

// // Function to get dashboard path based on role
// const getDashboardPath = (role) => {
//   const paths = {
//     super_admin: '/admin/dashboard',
//     manager: '/manager/dashboard',
//     supervisor: '/supervisor/dashboard',
//     technician: '/technician/dashboard',
//     customer: '/customer/dashboard',
//   };
//   return paths[role] || '/';
// };

// function App() {
//   const { user, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* Public Routes - No Layout wrapper needed since PublicLayout handles its own structure */}
//       <Route path="/" element={<Homepage />} />
//       <Route path="/services" element={<Services />} />
//       <Route path="/about" element={<AboutUs />} />
//       <Route path="/contact" element={<Contact />} />
//       <Route path="/testimonials" element={<Testimonials />} />
//       <Route path="/pricing" element={<Pricing />} />
      
//       {/* Auth Routes */}
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="/reset-password" element={<ResetPassword />} />
//       <Route path="/verify-otp" element={<VerifyOTP />} />
      
//       {/* Admin Routes */}
//       <Route element={<ProtectedRoute allowedRoles={['super_admin']}><AdminLayout /></ProtectedRoute>}>
//         <Route path="/admin/dashboard" element={<AdminDashboard />} />
//         <Route path="/admin/users" element={<UserManagement />} />
//         <Route path="/admin/buildings" element={<BuildingManagement />} />
//         <Route path="/admin/roles" element={<RoleManagement />} />
//         <Route path="/admin/complaints" element={<ComplaintMonitoring />} />
//         <Route path="/admin/attendance" element={<AttendanceMonitoring />} />
//         <Route path="/admin/leaves" element={<LeaveManagement />} />
//         <Route path="/admin/gps-tracking" element={<AdminGPSTracking />} />
//         <Route path="/admin/billing" element={<BillingControl />} />
//         <Route path="/admin/reports" element={<ReportsAnalytics />} />
//         <Route path="/admin/approvals" element={<ApprovalManagement />} />
//         <Route path="/admin/activity-logs" element={<ActivityLogs />} />
//         <Route path="/admin/settings" element={<SystemSettings />} />
//       </Route>
      
//       {/* Manager Routes */}
//       <Route element={<ProtectedRoute allowedRoles={['manager']}><ManagerLayout /></ProtectedRoute>}>
//         <Route path="/manager/dashboard" element={<ManagerDashboard />} />
//         <Route path="/manager/supervisors" element={<SupervisorManagement />} />
//         <Route path="/manager/technicians" element={<TechnicianAssignment />} />
//         <Route path="/manager/sla" element={<SLAMonitoring />} />
//         <Route path="/manager/attendance" element={<TeamAttendance />} />
//         <Route path="/manager/scheduling" element={<WorkScheduling />} />
//         <Route path="/manager/approvals" element={<Approvals />} />
//         <Route path="/manager/reports" element={<ManagerReports />} />
//         <Route path="/manager/complaints" element={<ComplaintMonitoring />} />
//         <Route path="/manager/building-performance" element={<BuildingPerformance />} />
//       </Route>
      
//       {/* Supervisor Routes */}
//       <Route element={<ProtectedRoute allowedRoles={['supervisor']}><SupervisorLayout /></ProtectedRoute>}>
//         <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
//         <Route path="/supervisor/technicians" element={<SupervisorTechnicianAssignment />} /> 
//         <Route path="/supervisor/field-staff" element={<FieldStaffMonitoring />} />
//         <Route path="/supervisor/verification" element={<WorkVerification />} />
//         <Route path="/supervisor/complaints" element={<ComplaintHandling />} />
//         <Route path="/supervisor/inspection" element={<SiteInspection />} />
//         <Route path="/supervisor/attendance" element={<AttendanceTracking />} />
//         <Route path="/supervisor/escalate" element={<EscalateIssues />} />
//         <Route path="/supervisor/communication" element={<TeamCommunication />} />
//         <Route path="/supervisor/reports" element={<SupervisorReports />} />
//       </Route>
      
//       {/* Technician Routes */}
//       <Route element={<ProtectedRoute allowedRoles={['technician']}><TechnicianLayout /></ProtectedRoute>}>
//         <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
//         <Route path="/technician/tasks" element={<MyTasks />} />
//         <Route path="/technician/tasks/:id" element={<TaskDetails />} />
//         <Route path="/technician/attendance" element={<TechnicianAttendance />} />
//         <Route path="/technician/notifications" element={<TechnicianNotifications />} />
//         <Route path="/technician/emergency" element={<EmergencyAlert />} />
//         <Route path="/technician/reports" element={<MyReports />} />
//         <Route path="/technician/profile" element={<TechnicianProfile />} />
//         <Route path="/technician/gps-tracking" element={<TechnicianGPSTracking />} />
//       </Route>
      
//       {/* Customer Routes */}
//       <Route element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout /></ProtectedRoute>}>
//         <Route path="/customer/dashboard" element={<CustomerDashboard />} />
//         <Route path="/customer/raise-complaint" element={<RaiseComplaint />} />
//         <Route path="/customer/request-service" element={<RequestService />} />
//         <Route path="/customer/complaints" element={<ComplaintStatus />} />
//         <Route path="/customer/invoices" element={<CustomerInvoices />} />
//         <Route path="/customer/payments" element={<PaymentHistory />} />
//         <Route path="/customer/chat" element={<ChatSupport />} />
//         <Route path="/customer/history" element={<ServiceHistory />} />
//         <Route path="/customer/profile" element={<CustomerProfile />} />
//       </Route>
      
//       {/* Default redirect - if user is logged in go to dashboard, else go to home */}
//       <Route 
//         path="/dashboard" 
//         element={
//           user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Navigate to="/" replace />
//         } 
//       />
      
//       {/* 404 - Redirect to home */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App;


import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/common/Loader';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';
import SupervisorLayout from './layouts/SupervisorLayout';
import TechnicianLayout from './layouts/TechnicianLayout';
import CustomerLayout from './layouts/CustomerLayout';
import PublicLayout from './layouts/PublicLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyOTP from './pages/auth/VerifyOTP';

//Common Attendance for ALL employees (Super Admin, Manager, Supervisor, Technician)
//import MyAttendance from './pages/employee/MyAttendance';
// Common Employee Pages (Attendance & Salary for all roles)
import MyAttendance from './pages/employee/MyAttendance';
import MySalary from './pages/employee/MySalary';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import BuildingManagement from './pages/admin/BuildingManagement';
import RoleManagement from './pages/admin/RoleManagement';
import ComplaintMonitoring from './pages/admin/ComplaintMonitoring';
import AttendanceMonitoring from './pages/admin/AttendanceMonitoring';
import LeaveManagement from './pages/admin/LeaveManagement';
import SalaryManagement from './pages/admin/SalaryManagement';
import AdminGPSTracking from './pages/admin/GPSTracking';
import BillingControl from './pages/admin/BillingControl';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import SystemSettings from './pages/admin/SystemSettings';
import ActivityLogs from './pages/admin/ActivityLogs';
import ApprovalManagement from './pages/admin/ApprovalManagement';
import SalaryConfig from './pages/admin/SalaryConfig';  // ✅ NEW - Salary Config Page

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import SupervisorManagement from './pages/manager/SupervisorManagement';
import TechnicianAssignment from './pages/manager/TechnicianAssignment';
import SLAMonitoring from './pages/manager/SLAMonitoring';
import TeamAttendance from './pages/manager/TeamAttendance';
import WorkScheduling from './pages/manager/WorkScheduling';
import Approvals from './pages/manager/Approvals';
import ManagerReports from './pages/manager/Reports';
import BuildingPerformance from './pages/manager/BuildingPerformance';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/Dashboard';
import FieldStaffMonitoring from './pages/supervisor/FieldStaffMonitoring';
import WorkVerification from './pages/supervisor/WorkVerification';
import ComplaintHandling from './pages/supervisor/ComplaintHandling';
import SiteInspection from './pages/supervisor/SiteInspection';
import AttendanceTracking from './pages/supervisor/AttendanceTracking';
import EscalateIssues from './pages/supervisor/EscalateIssues';
import TeamCommunication from './pages/supervisor/TeamCommunication';
import SupervisorTechnicianAssignment from './pages/supervisor/TechnicianAssignment';
import SupervisorReports from './pages/supervisor/Reports';

// Technician Pages
import TechnicianDashboard from './pages/technician/Dashboard';
import MyTasks from './pages/technician/MyTasks';
import TaskDetails from './pages/technician/TaskDetails';
import TechnicianAttendance from './pages/technician/Attendance';
import TechnicianNotifications from './pages/technician/Notifications';
import EmergencyAlert from './pages/technician/EmergencyAlert';
import MyReports from './pages/technician/MyReports';
import TechnicianProfile from './pages/technician/Profile';
import TechnicianGPSTracking from './pages/technician/GPSTracking';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import RaiseComplaint from './pages/customer/RaiseComplaint';
import RequestService from './pages/customer/RequestService';
import ComplaintStatus from './pages/customer/ComplaintStatus';
import CustomerInvoices from './pages/customer/Invoices';
import PaymentHistory from './pages/customer/PaymentHistory';
import ChatSupport from './pages/customer/ChatSupport';
import ServiceHistory from './pages/customer/ServiceHistory';
import CustomerProfile from './pages/customer/Profile';

// Public Pages
import Homepage from './pages/public/Homepage';
import Services from './pages/public/Services';
import AboutUs from './pages/public/AboutUs';
import Contact from './pages/public/Contact';
import Testimonials from './pages/public/Testimonials';
import Pricing from './pages/public/Pricing';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      super_admin: '/admin/dashboard',
      manager: '/manager/dashboard',
      supervisor: '/supervisor/dashboard',
      technician: '/technician/dashboard',
      customer: '/customer/dashboard',
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }
  
  return children;
};

// Function to get dashboard path based on role
const getDashboardPath = (role) => {
  const paths = {
    super_admin: '/admin/dashboard',
    manager: '/manager/dashboard',
    supervisor: '/supervisor/dashboard',
    technician: '/technician/dashboard',
    customer: '/customer/dashboard',
  };
  return paths[role] || '/';
};

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/testimonials" element={<Testimonials />} />
      <Route path="/pricing" element={<Pricing />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      
      {/* ==================== ADMIN ROUTES ==================== */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/buildings" element={<BuildingManagement />} />
        <Route path="/admin/roles" element={<RoleManagement />} />
        <Route path="/admin/complaints" element={<ComplaintMonitoring />} />
        <Route path="/admin/attendance" element={<AttendanceMonitoring />} />
        <Route path="/admin/leaves" element={<LeaveManagement />} />
        {/* ✅ ADMIN'S OWN ATTENDANCE (Check-in/out) */}
        <Route path="/admin/my-attendance" element={<MyAttendance />} />
        <Route path="/admin/gps-tracking" element={<AdminGPSTracking />} />
        {/* My Salary (Admin's own) */}
        <Route path="/admin/my-salary" element={<MySalary />} />
        {/* Salary Management */}
         <Route path="/admin/salary-config" element={<SalaryConfig />} />  {/* ✅ NEW */}
        <Route path="/admin/salary" element={<SalaryManagement />} />
        <Route path="/admin/billing" element={<BillingControl />} />
        <Route path="/admin/reports" element={<ReportsAnalytics />} />
        <Route path="/admin/approvals" element={<ApprovalManagement />} />
        <Route path="/admin/activity-logs" element={<ActivityLogs />} />
        <Route path="/admin/settings" element={<SystemSettings />} />
      </Route>
      
      {/* ==================== MANAGER ROUTES ==================== */}
      <Route element={<ProtectedRoute allowedRoles={['manager']}><ManagerLayout /></ProtectedRoute>}>
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/supervisors" element={<SupervisorManagement />} />
        <Route path="/manager/technicians" element={<TechnicianAssignment />} />
        <Route path="/manager/sla" element={<SLAMonitoring />} />
        <Route path="/manager/attendance" element={<TeamAttendance />} />
        {/* Manager's own attendance (Check-in/out) & salary */}
        <Route path="/manager/my-attendance" element={<MyAttendance />} />
        <Route path="/manager/my-salary" element={<MySalary />} />
        <Route path="/manager/scheduling" element={<WorkScheduling />} />
        <Route path="/manager/approvals" element={<Approvals />} />
        <Route path="/manager/reports" element={<ManagerReports />} />
        <Route path="/manager/complaints" element={<ComplaintMonitoring />} />
        <Route path="/manager/building-performance" element={<BuildingPerformance />} />
        {/* ✅ MANAGER'S OWN ATTENDANCE (Check-in/out) */}
        {/*<Route path="/manager/my-attendance" element={<MyAttendance />} />*/}
      </Route>
      
      {/* ==================== SUPERVISOR ROUTES ==================== */}
      <Route element={<ProtectedRoute allowedRoles={['supervisor']}><SupervisorLayout /></ProtectedRoute>}>
        <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
        <Route path="/supervisor/technicians" element={<SupervisorTechnicianAssignment />} /> 
        <Route path="/supervisor/field-staff" element={<FieldStaffMonitoring />} />
        <Route path="/supervisor/verification" element={<WorkVerification />} />
        <Route path="/supervisor/complaints" element={<ComplaintHandling />} />
        <Route path="/supervisor/inspection" element={<SiteInspection />} />
        <Route path="/supervisor/attendance" element={<AttendanceTracking />} />
        <Route path="/supervisor/escalate" element={<EscalateIssues />} />
        <Route path="/supervisor/communication" element={<TeamCommunication />} />
        <Route path="/supervisor/reports" element={<SupervisorReports />} />
        {/* ✅ SUPERVISOR'S OWN ATTENDANCE (Check-in/out) & salary */}
        <Route path="/supervisor/my-attendance" element={<MyAttendance />} />
        <Route path="/supervisor/my-salary" element={<MySalary />} />
      </Route>
      
      {/* ==================== TECHNICIAN ROUTES ==================== */}
      <Route element={<ProtectedRoute allowedRoles={['technician']}><TechnicianLayout /></ProtectedRoute>}>
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        <Route path="/technician/tasks" element={<MyTasks />} />
        <Route path="/technician/tasks/:id" element={<TaskDetails />} />
        <Route path="/technician/attendance" element={<TechnicianAttendance />} />
        <Route path="/technician/notifications" element={<TechnicianNotifications />} />
        <Route path="/technician/emergency" element={<EmergencyAlert />} />
        <Route path="/technician/reports" element={<MyReports />} />
        <Route path="/technician/profile" element={<TechnicianProfile />} />
        <Route path="/technician/gps-tracking" element={<TechnicianGPSTracking />} />
        {/* ✅ TECHNICIAN'S OWN ATTENDANCE (Check-in/out) & salary  */}
        <Route path="/technician/my-attendance" element={<MyAttendance />} />
        <Route path="/technician/my-salary" element={<MySalary />} />
      </Route>
      
      {/* ==================== CUSTOMER ROUTES ==================== */}
      <Route element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout /></ProtectedRoute>}>
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/raise-complaint" element={<RaiseComplaint />} />
        <Route path="/customer/request-service" element={<RequestService />} />
        <Route path="/customer/complaints" element={<ComplaintStatus />} />
        <Route path="/customer/invoices" element={<CustomerInvoices />} />
        <Route path="/customer/payments" element={<PaymentHistory />} />
        <Route path="/customer/chat" element={<ChatSupport />} />
        <Route path="/customer/history" element={<ServiceHistory />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
      </Route>
      
      {/* Default redirect */}
      <Route 
        path="/dashboard" 
        element={
          user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Navigate to="/" replace />
        } 
      />
      
      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;