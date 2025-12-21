'use client';

import { useState, useEffect } from 'react';

interface ExpiryInputProps {
  value: number; // Unix timestamp in seconds
  onChange: (value: number) => void;
  disabled?: boolean;
}

interface QuickExpiryOption {
  label: string;
  value: number; // days from now
}

const QUICK_EXPIRY_OPTIONS: QuickExpiryOption[] = [
  { label: '1 Day', value: 1 },
  { label: '3 Days', value: 3 },
  { label: '1 Week', value: 7 },
  { label: '2 Weeks', value: 14 },
  { label: '1 Month', value: 30 },
  { label: '3 Months', value: 90 },
  { label: '6 Months', value: 180 },
  { label: '1 Year', value: 365 },
];

// Helper to format date in local timezone (YYYY-MM-DD)
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to format time in local timezone (HH:MM)
const formatLocalTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function ExpiryInput({ value, onChange, disabled }: ExpiryInputProps) {
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [selectedQuickOption, setSelectedQuickOption] = useState<string>('7');

  useEffect(() => {
    if (value > 0) {
      const date = new Date(value * 1000);
      const dateStr = formatLocalDate(date);
      const timeStr = formatLocalTime(date);
      setDateInput(dateStr);
      setTimeInput(timeStr);
      
      // Check if current value matches any quick option
      const now = Math.floor(Date.now() / 1000);
      const diffDays = Math.floor((value - now) / 86400);
      const matchingOption = QUICK_EXPIRY_OPTIONS.find(opt => opt.value === diffDays);
      if (matchingOption) {
        setSelectedQuickOption(matchingOption.value.toString());
      } else {
        setSelectedQuickOption('custom');
      }
    } else {
      // Default to 1 week from now
      const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const dateStr = formatLocalDate(oneWeekLater);
      const timeStr = formatLocalTime(oneWeekLater);
      setDateInput(dateStr);
      setTimeInput(timeStr);
      setSelectedQuickOption('7');
      onChange(Math.floor(oneWeekLater.getTime() / 1000));
    }
  }, [value, onChange]);

  const handleQuickOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const optionValue = e.target.value;
    setSelectedQuickOption(optionValue);
    
    if (optionValue === 'custom') {
      // Keep current date/time, just mark as custom
      return;
    }
    
    const days = parseInt(optionValue);
    if (!isNaN(days)) {
      const expiry = Math.floor(Date.now() / 1000) + (days * 86400);
      onChange(expiry);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setDateInput(date);
    setSelectedQuickOption('custom');
    if (date && timeInput) {
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = timeInput.split(':').map(Number);
      const datetime = new Date(year, month - 1, day, hours, minutes);
      onChange(Math.floor(datetime.getTime() / 1000));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeInput(time);
    setSelectedQuickOption('custom');
    if (dateInput && time) {
      const [year, month, day] = dateInput.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      const datetime = new Date(year, month - 1, day, hours, minutes);
      onChange(Math.floor(datetime.getTime() / 1000));
    }
  };

  const minDate = formatLocalDate(new Date());

  return (
    <div className="form-group">
      <label htmlFor="expiry-input">
        Expiry Date & Time <span style={{ color: '#dc3545' }}>*</span>
      </label>
      
      <div className="expiry-time-row">
        <select
          id="expiry-quick-select"
          value={selectedQuickOption}
          onChange={handleQuickOptionChange}
          disabled={disabled}
          className="expiry-quick-select"
        >
          {QUICK_EXPIRY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value.toString()}>
              {option.label}
            </option>
          ))}
          <option value="custom">Custom Date/Time</option>
        </select>

        <input
          id="expiry-date-input"
          type="date"
          value={dateInput}
          onChange={handleDateChange}
          disabled={disabled}
          min={minDate}
          className="expiry-date-input"
        />

        <input
          id="expiry-time-input"
          type="time"
          value={timeInput}
          onChange={handleTimeChange}
          disabled={disabled}
          className="expiry-time-input"
        />
      </div>

      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
        This sets when the permission expires (deadline). After this date and time, the permission can no longer be used, regardless of the period duration.
      </div>
    </div>
  );
}
