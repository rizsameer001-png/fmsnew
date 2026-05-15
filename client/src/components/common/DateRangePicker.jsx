import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const presets = [
    { label: 'Today', getStart: () => new Date(), getEnd: () => new Date() },
    { label: 'Yesterday', getStart: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; }, getEnd: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
    { label: 'Last 7 Days', getStart: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d; }, getEnd: () => new Date() },
    { label: 'Last 30 Days', getStart: () => { const d = new Date(); d.setDate(d.getDate() - 30); return d; }, getEnd: () => new Date() },
    { label: 'This Month', getStart: () => { const d = new Date(); d.setDate(1); return d; }, getEnd: () => new Date() },
    { label: 'Last Month', getStart: () => { const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1); return d; }, getEnd: () => { const d = new Date(); d.setDate(0); return d; } },
  ];

  const applyPreset = (preset) => {
    onStartDateChange(preset.getStart());
    onEndDateChange(preset.getEnd());
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return 'Select dates';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <CalendarIcon className="h-5 w-5" />
        <span>
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : 'Select date range'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[500px]">
          <div className="flex">
            <div className="border-r border-gray-200 dark:border-gray-700 pr-4 mr-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Select</h4>
              <div className="space-y-1">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="block w-full text-left px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={onStartDateChange}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={onEndDateChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => setIsOpen(false)} className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800">
              Cancel
            </button>
            <button onClick={() => setIsOpen(false)} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;