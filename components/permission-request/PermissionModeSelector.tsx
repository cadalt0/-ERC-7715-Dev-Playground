'use client';

export type PermissionMode = 'periodic' | 'stream';

interface PermissionModeSelectorProps {
  value: PermissionMode;
  onChange: (mode: PermissionMode) => void;
  disabled?: boolean;
}

export default function PermissionModeSelector({
  value,
  onChange,
  disabled,
}: PermissionModeSelectorProps) {
  return (
    <div className="form-group">
      <label>
        Permission Mode <span style={{ color: '#dc3545' }}>*</span>
      </label>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={() => onChange('periodic')}
          disabled={disabled}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: value === 'periodic' ? '2px solid #0066ff' : '2px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: value === 'periodic' ? '#e6f0ff' : 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: value === 'periodic' ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          Periodic
        </button>
        <button
          type="button"
          onClick={() => onChange('stream')}
          disabled={disabled}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: value === 'stream' ? '2px solid #0066ff' : '2px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: value === 'stream' ? '#e6f0ff' : 'white',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: value === 'stream' ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          Stream
        </button>
      </div>
      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
        {value === 'periodic' 
          ? 'Periodic: Fixed amount per time period with resets'
          : 'Stream: Continuous linear accrual up to a maximum cap'}
      </div>
    </div>
  );
}
