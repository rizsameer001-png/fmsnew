import React, { useState, forwardRef } from 'react';
import DatePickerComponent from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/24/outline';
import 'react-datepicker/dist/react-datepicker.css';

const DatePicker = forwardRef(({ 
  label,
  selected,
  onChange,
  error,
  required,
  placeholder = 'Select date',
  minDate,
  maxDate,
  showTimeSelect = false,
  timeFormat = 'HH:mm',
  timeIntervals = 30,
  dateFormat = showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy',
  className = '',
  disabled = false,
  helperText,
  id
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const CustomInput = forwardRef(({ value, onClick, onChange }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        onClick={onClick}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } ${
          disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800'
        } ${className}`}
      />
      <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
    </div>
  ));

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <DatePickerComponent
        selected={selected}
        onChange={(date) => onChange(date)}
        onFocus={() => setIsOpen(true)}
        onClickOutside={() => setIsOpen(false)}
        customInput={<CustomInput />}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        dateFormat={dateFormat}
        disabled={disabled}
        placeholderText={placeholder}
        id={id}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;