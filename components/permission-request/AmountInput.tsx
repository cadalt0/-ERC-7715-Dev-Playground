'use client';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  tokenDecimals: number;
  tokenSymbol: string;
  isCustomToken?: boolean;
  disabled?: boolean;
}

export default function AmountInput({ 
  value, 
  onChange, 
  tokenDecimals, 
  tokenSymbol,
  isCustomToken = false,
  disabled 
}: AmountInputProps) {
  return (
    <div className="form-group">
      <label htmlFor="amount-input">
        Amount {!isCustomToken && `(${tokenSymbol})`} <span style={{ color: '#dc3545' }}>*</span>
      </label>
      <input
        id="amount-input"
        type="number"
        step="any"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`e.g., 0.001`}
        className="amount-input"
      />
      {!isCustomToken && (
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
          Token has {tokenDecimals} decimals. Enter amount in human-readable format.
        </div>
      )}
      {isCustomToken && (
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
          <strong>Note:</strong> Amount should be entered based on the custom token's decimal places (default: 18 decimals)
        </div>
      )}
    </div>
  );
}

