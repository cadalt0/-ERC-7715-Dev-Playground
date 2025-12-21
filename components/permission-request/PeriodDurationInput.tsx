'use client';

import { useState } from 'react';
import { PERIOD_DURATION_OPTIONS } from '@/lib/metamask-permissions/types';

interface PeriodDurationInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${seconds / 60} minutes`;
  if (seconds < 86400) return `${seconds / 3600} hours`;
  if (seconds < 604800) return `${seconds / 86400} days`;
  if (seconds < 2592000) return `${seconds / 604800} weeks`;
  return `${seconds / 2592000} months`;
}

export default function PeriodDurationInput({ value, onChange, disabled }: PeriodDurationInputProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const selectedOption = PERIOD_DURATION_OPTIONS.find(opt => opt.value === value);
  const displayValue = isCustomMode ? 'custom' : (selectedOption ? String(selectedOption.value) : 'custom');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'custom') {
      setIsCustomMode(true);
      // Keep current value, user can enter custom
      return;
    }
    setIsCustomMode(false);
    const val = parseInt(selectedValue);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customVal = parseInt(e.target.value);
    if (!isNaN(customVal) && customVal > 0) {
      onChange(customVal);
    }
  };

  return (
    <div className="form-group">
      <label htmlFor="period-duration-input">
        Period Duration <span style={{ color: '#dc3545' }}>*</span>
      </label>
      
      <div className="period-duration-container">
        <select
          id="period-duration-input"
          className="period-duration-select"
          value={displayValue}
          onChange={handleSelectChange}
          disabled={disabled}
        >
          {PERIOD_DURATION_OPTIONS.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label} ({formatDuration(option.value)})
            </option>
          ))}
          <option value="custom">Custom Duration</option>
        </select>

        {displayValue === 'custom' && (
          <input
            type="number"
            min="1"
            value={selectedOption ? '' : (value || '')}
            onChange={handleCustomChange}
            disabled={disabled}
            placeholder="Enter duration in seconds"
            className="period-duration-custom-input"
          />
        )}
      </div>

      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
        This sets how often the permission can be used (frequency/interval). For example, "Every Day" means you can redeem the permission once per day.
      </div>

      {value > 0 && (
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
          Selected: <strong>{formatDuration(value)}</strong>
        </div>
      )}
    </div>
  );
}
