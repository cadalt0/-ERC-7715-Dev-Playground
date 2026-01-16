'use client';

interface InitialAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  tokenSymbol: string;
}

export default function InitialAmountInput({
  value,
  onChange,
  disabled,
  tokenSymbol,
}: InitialAmountInputProps) {
  return (
    <div className="form-group">
      <label htmlFor="initial-amount-input">
        Initial Amount <span style={{ color: '#dc3545' }}>*</span>
      </label>
      <input
        id="initial-amount-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`e.g., 0.1 ${tokenSymbol}`}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          fontSize: '1rem',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
        Amount immediately available at startTime (can be 0)
      </div>
    </div>
  );
}
