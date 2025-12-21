'use client';

import { useState, useEffect } from 'react';

interface StartTimeInputProps {
  value: number; // Unix timestamp in seconds
  onChange: (value: number) => void;
  disabled?: boolean;
}

interface QuickTimeOption {
  label: string;
  value: number; // minutes from now
}

const QUICK_TIME_OPTIONS: QuickTimeOption[] = [
  { label: 'Now', value: 0 },
  { label: '+5 minutes', value: 5 },
  { label: '+15 minutes', value: 15 },
  { label: '+30 minutes', value: 30 },
  { label: '+1 hour', value: 60 },
  { label: '+2 hours', value: 120 },
  { label: '+6 hours', value: 360 },
  { label: '+12 hours', value: 720 },
  { label: '+1 day', value: 1440 },
];

export default function StartTimeInput({ value, onChange, disabled }: StartTimeInputProps) {
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [selectedQuickOption, setSelectedQuickOption] = useState<string>('now');

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

  useEffect(() => {
    if (value > 0) {
      const date = new Date(value * 1000);
      // Use local timezone for both date and time
      const dateStr = formatLocalDate(date);
      const timeStr = formatLocalTime(date);
      setDateInput(dateStr);
      setTimeInput(timeStr);
      
      // Check if current value matches any quick option
      const now = Math.floor(Date.now() / 1000);
      const diffMinutes = Math.floor((value - now) / 60);
      const matchingOption = QUICK_TIME_OPTIONS.find(opt => opt.value === diffMinutes);
      if (matchingOption) {
        setSelectedQuickOption(matchingOption.value === 0 ? 'now' : `+${matchingOption.value}`);
      } else {
        setSelectedQuickOption('custom');
      }
    } else {
      // Default to current date/time in local timezone
      const now = new Date();
      const dateStr = formatLocalDate(now);
      const timeStr = formatLocalTime(now);
      setDateInput(dateStr);
      setTimeInput(timeStr);
      setSelectedQuickOption('now');
      onChange(Math.floor(now.getTime() / 1000));
    }
  }, [value, onChange]);

  const handleQuickOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const optionValue = e.target.value;
    setSelectedQuickOption(optionValue);
    
    if (optionValue === 'custom') {
      // Keep current date/time, just mark as custom
      return;
    }
    
    if (optionValue === 'now') {
      const now = Math.floor(Date.now() / 1000);
      onChange(now);
    } else {
      const minutes = parseInt(optionValue.replace('+', ''));
      const startTime = Math.floor(Date.now() / 1000) + (minutes * 60);
      onChange(startTime);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setDateInput(date);
    setSelectedQuickOption('custom');
    if (date && timeInput) {
      // Create date in local timezone
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
      // Create date in local timezone
      const [year, month, day] = dateInput.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      const datetime = new Date(year, month - 1, day, hours, minutes);
      onChange(Math.floor(datetime.getTime() / 1000));
    }
  };

  const minDate = formatLocalDate(new Date());

  return (
    <div className="form-group">
      <label htmlFor="start-time-input">
        Start Time <span style={{ color: '#dc3545' }}>*</span>
      </label>
      
      <div className="start-time-row">
        <select
          id="start-time-quick-select"
          value={selectedQuickOption}
          onChange={handleQuickOptionChange}
          disabled={disabled}
          className="start-time-quick-select"
        >
          {QUICK_TIME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value === 0 ? 'now' : `+${option.value}`}>
              {option.label}
            </option>
          ))}
          <option value="custom">Custom Date/Time</option>
        </select>

        <input
          id="start-time-date-input"
          type="date"
          value={dateInput}
          onChange={handleDateChange}
          disabled={disabled}
          min={minDate}
          className="start-time-date-input"
        />

        <input
          id="start-time-time-input"
          type="time"
          value={timeInput}
          onChange={handleTimeChange}
          disabled={disabled}
          className="start-time-time-input"
        />
      </div>
    </div>
  );
}
