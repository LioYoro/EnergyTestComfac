import React, { useState } from 'react';
import { format } from 'date-fns';

const DateRangePicker = ({ defaultText = 'Select Date Range' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [displayText, setDisplayText] = useState(defaultText);

  const handleDateSelect = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setDisplayText(`${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`);
    setIsOpen(false);
  };

  const presetRanges = [
    {
      label: 'Today',
      start: new Date(),
      end: new Date()
    },
    {
      label: 'Yesterday',
      start: new Date(Date.now() - 86400000),
      end: new Date(Date.now() - 86400000)
    },
    {
      label: 'Last 7 Days',
      start: new Date(Date.now() - 6 * 86400000),
      end: new Date()
    },
    {
      label: 'Last 30 Days',
      start: new Date(Date.now() - 29 * 86400000),
      end: new Date()
    }
  ];

  return (
    <div className="relative">
      <div 
        className="date-range-picker flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="far fa-calendar-alt mr-2 text-gray-500"></i>
        <span>{displayText}</span>
        <i className="fas fa-chevron-down ml-2 text-gray-500"></i>
      </div>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[250px]">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 mb-2">Quick Select</h4>
            {presetRanges.map((range, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(range.start, range.end)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={format(startDate, 'yyyy-MM-dd')}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={format(endDate, 'yyyy-MM-dd')}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <button
                onClick={() => handleDateSelect(startDate, endDate)}
                className="mt-2 w-full px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DateRangePicker;

