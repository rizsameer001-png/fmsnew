// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { 
//   MapPinIcon, 
//   CameraIcon, 
//   CheckCircleIcon,
//   ClockIcon,
//   CalendarIcon,
//   ExclamationTriangleIcon,
//   ArrowPathIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import attendanceService from '../../services/attendance.service';
// import useGeolocation from '../../hooks/useGeolocation';
// import { formatDate, formatTime } from '../../utils/formatters';

// const MyAttendance = () => {
//   const [checkInPhoto, setCheckInPhoto] = useState(null);
//   const [checkOutPhoto, setCheckOutPhoto] = useState(null);
//   const [isChecking, setIsChecking] = useState(false);
//   const [dateRange, setDateRange] = useState({ start: '', end: '' });
//   const queryClient = useQueryClient();
//   const { location, error: locationError, isLoading: locationLoading } = useGeolocation();

//   // Get current user from localStorage
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const userRole = user?.role || 'employee';

//   // Get today's attendance status
//   const { data: todayStatus, refetch: refetchToday } = useQuery({
//     queryKey: ['todayAttendance'],
//     queryFn: () => attendanceService.getTodayStatus(),
//   });

//   // Get attendance history
//   const { data: historyData, isLoading: historyLoading } = useQuery({
//     queryKey: ['myAttendanceHistory', dateRange],
//     queryFn: () => attendanceService.getMyAttendance(dateRange),
//   });

//   // Check-in mutation
//   const checkInMutation = useMutation({
//     mutationFn: (data) => attendanceService.checkIn(data),
//     onSuccess: (response) => {
//       queryClient.invalidateQueries(['todayAttendance']);
//       queryClient.invalidateQueries(['myAttendanceHistory']);
//       toast.success(response.message || 'Check-in successful!');
//       setIsChecking(false);
//       refetchToday();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Check-in failed');
//       setIsChecking(false);
//     },
//   });

//   // Check-out mutation
//   const checkOutMutation = useMutation({
//     mutationFn: (data) => attendanceService.checkOut(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['todayAttendance']);
//       queryClient.invalidateQueries(['myAttendanceHistory']);
//       toast.success('Check-out successful!');
//       setIsChecking(false);
//       refetchToday();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Check-out failed');
//       setIsChecking(false);
//     },
//   });

//   const handleCheckIn = async () => {
//     if (!location) {
//       toast.error('Unable to get your location. Please enable GPS.');
//       return;
//     }
//     setIsChecking(true);
//     await checkInMutation.mutateAsync({
//       latitude: location.latitude,
//       longitude: location.longitude,
//       address: `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`,
//       photo: checkInPhoto,
//       deviceInfo: { browser: navigator.userAgent }
//     });
//   };

//   const handleCheckOut = async () => {
//     if (!location) {
//       toast.error('Unable to get your location. Please enable GPS.');
//       return;
//     }
//     setIsChecking(true);
//     await checkOutMutation.mutateAsync({
//       latitude: location.latitude,
//       longitude: location.longitude,
//       address: `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`,
//       photo: checkOutPhoto,
//       deviceInfo: { browser: navigator.userAgent }
//     });
//   };

//   const status = todayStatus || {};

//   // Get role-specific greeting
//   const getRoleGreeting = () => {
//     const greetings = {
//       super_admin: 'Administrator',
//       manager: 'Manager',
//       supervisor: 'Supervisor',
//       technician: 'Technician',
//       customer: 'Customer'
//     };
//     return greetings[userRole] || 'Employee';
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             {getRoleGreeting()} - Mark your daily attendance with location verification
//           </p>
//         </div>
//         <button 
//           onClick={() => refetchToday()} 
//           className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//         >
//           <ArrowPathIcon className="h-5 w-5" />
//           <span>Refresh</span>
//         </button>
//       </div>

//       {/* Current Status Card */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             Today's Status - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//           </h3>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className={`rounded-lg p-4 text-center ${status.isCheckedIn ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Check In</p>
//                 <p className="text-xl font-bold text-green-600 dark:text-green-400">
//                   {status.checkIn ? formatTime(status.checkIn) : '--:--'}
//                 </p>
//                 {status.lateMinutes > 0 && (
//                   <p className="text-xs text-yellow-600 mt-1">Late by {status.lateMinutes} min</p>
//                 )}
//               </div>
//               <div className={`rounded-lg p-4 text-center ${status.isCheckedOut ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Check Out</p>
//                 <p className="text-xl font-bold text-red-600 dark:text-red-400">
//                   {status.checkOut ? formatTime(status.checkOut) : '--:--'}
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//               <span className="text-gray-600 dark:text-gray-400">Total Hours Today</span>
//               <span className="font-semibold text-gray-900 dark:text-white">
//                 {status.totalHours?.toFixed(1) || '0'} hours
//               </span>
//             </div>
            
//             <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//               <span className="text-gray-600 dark:text-gray-400">Status</span>
//               <span className={`font-semibold ${
//                 status.status === 'present' ? 'text-green-600' : 
//                 status.status === 'late' ? 'text-yellow-600' : 
//                 'text-gray-600'
//               }`}>
//                 {status.status?.toUpperCase() || 'NOT CHECKED IN'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Location Status */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Status</h3>
//           {locationLoading ? (
//             <div className="flex items-center justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//             </div>
//           ) : location ? (
//             <div className="space-y-3">
//               <div className="flex items-center space-x-2 text-green-600">
//                 <MapPinIcon className="h-5 w-5" />
//                 <span>📍 Location detected</span>
//               </div>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Latitude: {location.latitude.toFixed(6)}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Longitude: {location.longitude.toFixed(6)}
//               </p>
//               <p className="text-sm text-gray-500 dark:text-gray-500">
//                 Accuracy: ±{Math.round(location.accuracy)} meters
//               </p>
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
//               <p className="text-red-600 dark:text-red-400">{locationError || 'Unable to get location'}</p>
//               <p className="text-sm text-gray-500 mt-2">Please enable GPS and refresh the page</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {!status.isCheckedIn && (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check In</h3>
//             <div className="space-y-4">
//               <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
//                 <input 
//                   type="file" 
//                   accept="image/*" 
//                   className="hidden" 
//                   id="checkinPhoto" 
//                   onChange={(e) => setCheckInPhoto(e.target.files[0])} 
//                 />
//                 <label htmlFor="checkinPhoto" className="cursor-pointer flex flex-col items-center">
//                   <CameraIcon className="h-8 w-8 text-gray-400" />
//                   <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     Take selfie (Optional)
//                   </span>
//                 </label>
//               </div>
//               <button
//                 onClick={handleCheckIn}
//                 disabled={isChecking || !location}
//                 className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
//               >
//                 {isChecking ? 'Checking in...' : 'Check In'}
//               </button>
//             </div>
//           </div>
//         )}

//         {status.isCheckedIn && !status.isCheckedOut && (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check Out</h3>
//             <div className="space-y-4">
//               <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
//                 <input 
//                   type="file" 
//                   accept="image/*" 
//                   className="hidden" 
//                   id="checkoutPhoto" 
//                   onChange={(e) => setCheckOutPhoto(e.target.files[0])} 
//                 />
//                 <label htmlFor="checkoutPhoto" className="cursor-pointer flex flex-col items-center">
//                   <CameraIcon className="h-8 w-8 text-gray-400" />
//                   <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     Take selfie (Optional)
//                   </span>
//                 </label>
//               </div>
//               <button
//                 onClick={handleCheckOut}
//                 disabled={isChecking || !location}
//                 className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
//               >
//                 {isChecking ? 'Checking out...' : 'Check Out'}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Attendance History */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance History</h3>
//           <div className="flex space-x-2">
//             <input
//               type="date"
//               value={dateRange.start}
//               onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//               className="px-2 py-1 text-sm border rounded-lg dark:bg-gray-700"
//               placeholder="Start Date"
//             />
//             <input
//               type="date"
//               value={dateRange.end}
//               onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//               className="px-2 py-1 text-sm border rounded-lg dark:bg-gray-700"
//               placeholder="End Date"
//             />
//           </div>
//         </div>
        
//         {historyLoading ? (
//           <div className="flex justify-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//           </div>
//         ) : (
//           <>
//             {/* Summary Cards */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//               <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
//                 <p className="text-xs text-gray-500">Total Days</p>
//                 <p className="text-xl font-bold">{historyData?.summary?.totalDays || 0}</p>
//               </div>
//               <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
//                 <p className="text-xs text-green-600">Present</p>
//                 <p className="text-xl font-bold text-green-600">{historyData?.summary?.present || 0}</p>
//               </div>
//               <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
//                 <p className="text-xs text-yellow-600">Late</p>
//                 <p className="text-xl font-bold text-yellow-600">{historyData?.summary?.late || 0}</p>
//               </div>
//               <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
//                 <p className="text-xs text-blue-600">Total Hours</p>
//                 <p className="text-xl font-bold text-blue-600">{historyData?.summary?.totalHours?.toFixed(1) || 0}</p>
//               </div>
//             </div>

//             {/* History Table */}
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                 <thead className="bg-gray-50 dark:bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                   {historyData?.attendance?.map((record) => (
//                     <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                       <td className="px-4 py-3 text-sm">{formatDate(record.date)}</td>
//                       <td className="px-4 py-3 text-sm capitalize">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}</td>
//                       <td className="px-4 py-3 text-sm">{record.checkIn?.time ? formatTime(record.checkIn.time) : '-'}</td>
//                       <td className="px-4 py-3 text-sm">{record.checkOut?.time ? formatTime(record.checkOut.time) : '-'}</td>
//                       <td className="px-4 py-3 text-sm">{record.totalHours?.toFixed(1) || '-'}</td>
//                       <td className="px-4 py-3">
//                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                           record.status === 'present' ? 'bg-green-100 text-green-800' :
//                           record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-red-100 text-red-800'
//                         }`}>
//                           {record.status?.toUpperCase() || 'ABSENT'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyAttendance;



//updated code for photo upload
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPinIcon, 
  CameraIcon, 
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import attendanceService from '../../services/attendance.service';
import useGeolocation from '../../hooks/useGeolocation';
import { formatDate, formatTime } from '../../utils/formatters';

const MyAttendance = () => {
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const queryClient = useQueryClient();
  const { location, error: locationError, isLoading: locationLoading } = useGeolocation();

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role || 'employee';

  // Get today's attendance status
  const { data: todayStatus, refetch: refetchToday } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: () => attendanceService.getTodayStatus(),
  });

  // Get attendance history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['myAttendanceHistory', dateRange],
    queryFn: () => attendanceService.getMyAttendance(dateRange),
  });

  // Handle file to base64 conversion
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (data) => {
      // Convert photo to base64 if exists
      let photoBase64 = null;
      if (data.photo) {
        photoBase64 = await fileToBase64(data.photo);
      }
      
      const payload = {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        photo: photoBase64,  // Send null instead of {} if no photo
        deviceInfo: data.deviceInfo
      };
      return attendanceService.checkIn(payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['todayAttendance']);
      queryClient.invalidateQueries(['myAttendanceHistory']);
      toast.success(response.message || 'Check-in successful!');
      setIsChecking(false);
      setCheckInPhoto(null);
      refetchToday();
    },
    onError: (error) => {
      console.error('Check-in error:', error);
      toast.error(error.response?.data?.message || 'Check-in failed');
      setIsChecking(false);
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async (data) => {
      // Convert photo to base64 if exists
      let photoBase64 = null;
      if (data.photo) {
        photoBase64 = await fileToBase64(data.photo);
      }
      
      const payload = {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        photo: photoBase64,  // Send null instead of {} if no photo
        deviceInfo: data.deviceInfo
      };
      return attendanceService.checkOut(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todayAttendance']);
      queryClient.invalidateQueries(['myAttendanceHistory']);
      toast.success('Check-out successful!');
      setIsChecking(false);
      setCheckOutPhoto(null);
      refetchToday();
    },
    onError: (error) => {
      console.error('Check-out error:', error);
      toast.error(error.response?.data?.message || 'Check-out failed');
      setIsChecking(false);
    },
  });

  const handleCheckIn = async () => {
    if (!location) {
      toast.error('Unable to get your location. Please enable GPS.');
      return;
    }
    setIsChecking(true);
    await checkInMutation.mutateAsync({
      latitude: location.latitude,
      longitude: location.longitude,
      address: `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`,
      photo: checkInPhoto,
      deviceInfo: { browser: navigator.userAgent, timestamp: new Date().toISOString() }
    });
  };

  const handleCheckOut = async () => {
    if (!location) {
      toast.error('Unable to get your location. Please enable GPS.');
      return;
    }
    setIsChecking(true);
    await checkOutMutation.mutateAsync({
      latitude: location.latitude,
      longitude: location.longitude,
      address: `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`,
      photo: checkOutPhoto,
      deviceInfo: { browser: navigator.userAgent, timestamp: new Date().toISOString() }
    });
  };

  const status = todayStatus || {};

  // Get role-specific greeting
  const getRoleGreeting = () => {
    const greetings = {
      super_admin: 'Administrator',
      manager: 'Manager',
      supervisor: 'Supervisor',
      technician: 'Technician',
      customer: 'Customer'
    };
    return greetings[userRole] || 'Employee';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {getRoleGreeting()} - Mark your daily attendance with location verification
          </p>
        </div>
        <button 
          onClick={() => refetchToday()} 
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Current Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Status - {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month:'long', day: 'numeric' })}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-lg p-4 text-center ${status.isCheckedIn ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check In</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {status.checkIn ? formatTime(status.checkIn) : '--:--'}
                </p>
                {status.lateMinutes > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">Late by {status.lateMinutes} min</p>
                )}
              </div>
              <div className={`rounded-lg p-4 text-center ${status.isCheckedOut ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check Out</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {status.checkOut ? formatTime(status.checkOut) : '--:--'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Total Hours Today</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {status.totalHours?.toFixed(1) || '0'} hours
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className={`font-semibold ${
                status.status === 'present' ? 'text-green-600' : 
                status.status === 'late' ? 'text-yellow-600' : 
                'text-gray-600'
              }`}>
                {status.status?.toUpperCase() || 'NOT CHECKED IN'}
              </span>
            </div>
          </div>
        </div>

        {/* Location Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Status</h3>
          {locationLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : location ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-600">
                <MapPinIcon className="h-5 w-5" />
                <span>📍 Location detected</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Latitude: {location.latitude.toFixed(6)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Longitude: {location.longitude.toFixed(6)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Accuracy: ±{Math.round(location.accuracy)} meters
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-red-600 dark:text-red-400">{locationError || 'Unable to get location'}</p>
              <p className="text-sm text-gray-500 mt-2">Please enable GPS and refresh the page</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!status.isCheckedIn && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check In</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="checkinPhoto" 
                  onChange={(e) => setCheckInPhoto(e.target.files[0])} 
                />
                <label htmlFor="checkinPhoto" className="cursor-pointer flex flex-col items-center">
                  <CameraIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {checkInPhoto ? 'Photo selected' : 'Take selfie (Optional)'}
                  </span>
                </label>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={isChecking || !location}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {isChecking ? 'Checking in...' : 'Check In'}
              </button>
            </div>
          </div>
        )}

        {status.isCheckedIn && !status.isCheckedOut && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check Out</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="checkoutPhoto" 
                  onChange={(e) => setCheckOutPhoto(e.target.files[0])} 
                />
                <label htmlFor="checkoutPhoto" className="cursor-pointer flex flex-col items-center">
                  <CameraIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {checkOutPhoto ? 'Photo selected' : 'Take selfie (Optional)'}
                  </span>
                </label>
              </div>
              <button
                onClick={handleCheckOut}
                disabled={isChecking || !location}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                {isChecking ? 'Checking out...' : 'Check Out'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance History</h3>
          <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-2 py-1 text-sm border rounded-lg dark:bg-gray-700"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-2 py-1 text-sm border rounded-lg dark:bg-gray-700"
              placeholder="End Date"
            />
          </div>
        </div>
        
        {historyLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Total Days</p>
                <p className="text-xl font-bold">{historyData?.summary?.totalDays || 0}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-green-600">Present</p>
                <p className="text-xl font-bold text-green-600">{historyData?.summary?.present || 0}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-yellow-600">Late</p>
                <p className="text-xl font-bold text-yellow-600">{historyData?.summary?.late || 0}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-600">Total Hours</p>
                <p className="text-xl font-bold text-blue-600">{historyData?.summary?.totalHours?.toFixed(1) || 0}</p>
              </div>
            </div>

            {/* History Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {historyData?.attendance?.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 text-sm capitalize">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}</td>
                      <td className="px-4 py-3 text-sm">{record.checkIn?.time ? formatTime(record.checkIn.time) : '-'}</td>
                      <td className="px-4 py-3 text-sm">{record.checkOut?.time ? formatTime(record.checkOut.time) : '-'}</td>
                      <td className="px-4 py-3 text-sm">{record.totalHours?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status?.toUpperCase() || 'ABSENT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyAttendance;