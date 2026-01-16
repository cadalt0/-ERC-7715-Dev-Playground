'use client';

interface AmountPerSecondInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  tokenSymbol: string;
}

export default function AmountPerSecondInput({
  value,
  onChange,
  disabled,
  tokenSymbol,
}: AmountPerSecondInputProps) {
  return (
    <div className="form-group">
      <label htmlFor="amount-per-second-input">
        Amount Per Second <span style={{ color: '#dc3545' }}>*</span>
      </label>
      <input
        id="amount-per-second-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`e.g., 0.0001 ${tokenSymbol}/second`}
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
        Rate at which tokens accrue per second after startTime
      </div>
    </div>
  );
}
