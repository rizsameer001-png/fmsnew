import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPinIcon, 
  CameraIcon, 
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import attendanceService from '../../services/attendance.service';
import gpsService from '../../services/gps.service';
import useGeolocation from '../../hooks/useGeolocation';
import { formatDate, formatTime } from '../../utils/formatters';

const TechnicianAttendance = () => {
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();
  const { location, error: locationError, isLoading: locationLoading } = useGeolocation();

  const { data: todayAttendance, refetch } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: () => attendanceService.getTodayStatus(),
  });

  const checkInMutation = useMutation({
    mutationFn: (data) => attendanceService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['todayAttendance']);
      queryClient.invalidateQueries(['technicianDashboard']);
      toast.success('Check-in successful!');
      setIsChecking(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Check-in failed');
      setIsChecking(false);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (data) => attendanceService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['todayAttendance']);
      queryClient.invalidateQueries(['technicianDashboard']);
      toast.success('Check-out successful!');
      setIsChecking(false);
    },
  });

  const { data: attendanceHistory } = useQuery({
    queryKey: ['attendanceHistory'],
    queryFn: () => attendanceService.getMyAttendance({ limit: 30 }),
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
      address: 'Current Location',
      photo: checkInPhoto,
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
      address: 'Current Location',
      photo: checkOutPhoto,
    });
  };

  const attendance = todayAttendance || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Mark your daily attendance with location verification</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Status</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Check In</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {attendance.checkIn ? formatTime(attendance.checkIn) : '--:--'}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Check Out</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {attendance.checkOut ? formatTime(attendance.checkOut) : '--:--'}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Total Hours</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {attendance.totalHours?.toFixed(1) || '0'} hours
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className={`font-semibold ${attendance.status === 'present' ? 'text-green-600' : attendance.status === 'late' ? 'text-yellow-600' : 'text-gray-600'}`}>
                {attendance.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>
        </div>

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
                <span>Location detected</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Accuracy: ±{location.accuracy} meters
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-red-600 dark:text-red-400">{locationError || 'Unable to get location'}</p>
              <p className="text-sm text-gray-500 mt-2">Please enable GPS and refresh</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!attendance.checkIn && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check In</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
                <input type="file" accept="image/*" className="hidden" id="checkinPhoto" onChange={(e) => setCheckInPhoto(e.target.files[0])} />
                <label htmlFor="checkinPhoto" className="cursor-pointer flex flex-col items-center">
                  <CameraIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Take selfie</span>
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

        {attendance.checkIn && !attendance.checkOut && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check Out</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 transition">
                <input type="file" accept="image/*" className="hidden" id="checkoutPhoto" onChange={(e) => setCheckOutPhoto(e.target.files[0])} />
                <label htmlFor="checkoutPhoto" className="cursor-pointer flex flex-col items-center">
                  <CameraIcon className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Take selfie</span>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {attendanceHistory?.attendance?.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatDate(record.date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{record.checkIn?.time ? formatTime(record.checkIn.time) : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{record.checkOut?.time ? formatTime(record.checkOut.time) : '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{record.totalHours?.toFixed(1) || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {record.status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TechnicianAttendance;