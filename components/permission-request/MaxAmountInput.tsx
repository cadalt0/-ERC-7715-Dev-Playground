'use client';

interface MaxAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  tokenSymbol: string;
}

export default function MaxAmountInput({
  value,
  onChange,
  disabled,
  tokenSymbol,
}: MaxAmountInputProps) {
  return (
    <div className="form-group">
      <label htmlFor="max-amount-input">
        Maximum Amount <span style={{ color: '#dc3545' }}>*</span>
      </label>
      <input
        id="max-amount-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`e.g., 1 ${tokenSymbol}`}
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
        Maximum total amount that can ever be transferred (hard cap)
      </div>
    </div>
  );
}
