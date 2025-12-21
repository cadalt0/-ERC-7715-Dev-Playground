'use client';

import { useState, useEffect } from 'react';
import { PermissionConfig, PermissionType, TokenInfo, COMMON_TOKENS } from '@/lib/metamask-permissions/types';
import TokenSelector from './TokenSelector';
import AmountInput from './AmountInput';
import PeriodDurationInput from './PeriodDurationInput';
import ExpiryInput from './ExpiryInput';
import StartTimeInput from './StartTimeInput';

interface PermissionRequestFormProps {
  onSubmit: (config: PermissionConfig) => void;
  disabled?: boolean;
  defaultConfig?: Partial<PermissionConfig>;
}

export default function PermissionRequestForm({ 
  onSubmit, 
  disabled,
  defaultConfig 
}: PermissionRequestFormProps) {
  // Default to native ETH
  const [token, setToken] = useState<TokenInfo>(
    defaultConfig?.permissionType === 'erc20-token-periodic' && defaultConfig?.tokenAddress
      ? COMMON_TOKENS.find(t => t.address?.toLowerCase() === defaultConfig.tokenAddress!.toLowerCase()) || COMMON_TOKENS[0]
      : COMMON_TOKENS[0] // NATIVE_TOKEN is first
  );
  const [isCustomTokenSelected, setIsCustomTokenSelected] = useState(false);
  // Default amount: absolute minimum for native ETH (1 wei = 0.000000000000000001 ETH), 0.001 for ERC-20 tokens
  const defaultAmount = defaultConfig?.amount || (token.isNative ? '0.000000000000000001' : '0.001');
  const [amount, setAmount] = useState(defaultAmount);
  const [periodDuration, setPeriodDuration] = useState(defaultConfig?.periodDuration || 86400);
  const [startTime, setStartTime] = useState(defaultConfig?.startTime || Math.floor(Date.now() / 1000));
  const [expiry, setExpiry] = useState(defaultConfig?.expiry || Math.floor(Date.now() / 1000) + 604800);
  const [justification, setJustification] = useState(defaultConfig?.justification || '');
  const [isAdjustmentAllowed, setIsAdjustmentAllowed] = useState(defaultConfig?.isAdjustmentAllowed ?? true);
  const [chainId, setChainId] = useState(defaultConfig?.chainId || 11155111); // Sepolia

  useEffect(() => {
    if (defaultConfig?.permissionType === 'erc20-token-periodic' && defaultConfig?.tokenAddress) {
      const foundToken = COMMON_TOKENS.find(t => t.address?.toLowerCase() === defaultConfig.tokenAddress!.toLowerCase());
      if (foundToken) {
        setToken(foundToken);
      }
    }
  }, [defaultConfig?.tokenAddress, defaultConfig?.permissionType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const isNative = token.isNative || token.address === null;
    const permissionType: PermissionType = isNative ? 'native-token-periodic' : 'erc20-token-periodic';

    const config: PermissionConfig = {
      permissionType,
      tokenAddress: isNative ? undefined : token.address!,
      amount,
      tokenDecimals: token.decimals,
      periodDuration,
      startTime: isNative ? startTime : undefined,
      expiry,
      justification: justification || `Permission to transfer ${amount} ${token.symbol} every ${periodDuration} seconds`,
      isAdjustmentAllowed,
      chainId,
    };

    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <div className="step">
        <div className="step-title"> Request Advanced Permission</div>
        <div className="step-description">
          Configure your ERC-7715 advanced permission request
        </div>
      </div>

      <div className="token-amount-row">
        <div className="token-selector-container">
          <TokenSelector
            value={token.address}
            onChange={(newToken) => {
              setToken(newToken);
              setIsCustomTokenSelected(
                !!(
                  newToken.symbol === 'CUSTOM' || 
                  newToken.address === 'CUSTOM_PLACEHOLDER' ||
                  (newToken.address && !COMMON_TOKENS.find(t => t.address?.toLowerCase() === newToken.address?.toLowerCase()))
                )
              );
              // Update amount default when token changes (only if user hasn't modified it)
              if (amount === '0.001' || amount === '0.000000000000000001') {
                setAmount(newToken.isNative ? '0.000000000000000001' : '0.001');
              }
            }}
            disabled={disabled}
          />
        </div>
        <div className="amount-input-container">
          <AmountInput
            value={amount}
            onChange={setAmount}
            tokenDecimals={token.decimals}
            tokenSymbol={token.symbol}
            isCustomToken={isCustomTokenSelected || token.symbol === 'CUSTOM'}
            disabled={disabled}
          />
        </div>
      </div>

      {token.isNative && (
        <StartTimeInput
          value={startTime}
          onChange={setStartTime}
          disabled={disabled}
        />
      )}

      <PeriodDurationInput
        value={periodDuration}
        onChange={setPeriodDuration}
        disabled={disabled}
      />

      <ExpiryInput
        value={expiry}
        onChange={setExpiry}
        disabled={disabled}
      />

      <div className="form-group">
        <label htmlFor="justification-input">
          Justification (Optional)
        </label>
        <textarea
          id="justification-input"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          disabled={disabled}
          placeholder={`e.g., Permission to transfer ${amount} ${token.symbol} every ${periodDuration} seconds`}
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
          This message will be shown to the user when requesting permission
        </div>
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isAdjustmentAllowed}
            onChange={(e) => setIsAdjustmentAllowed(e.target.checked)}
            disabled={disabled}
            style={{ width: 'auto' }}
          />
          Allow adjustment (isAdjustmentAllowed)
        </label>
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
          If enabled, the user can adjust the permission parameters when approving
        </div>
      </div>

      <button 
        type="submit" 
        disabled={disabled || (!token.isNative && !token.address) || !amount || parseFloat(amount) <= 0}
      >
        Request Permission
      </button>
    </form>
  );
}

