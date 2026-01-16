'use client';

import { useState, useEffect } from 'react';
import { PermissionConfig, PermissionType, TokenInfo, COMMON_TOKENS } from '@/lib/metamask-permissions/types';
import TokenSelector from './TokenSelector';
import AmountInput from './AmountInput';
import PeriodDurationInput from './PeriodDurationInput';
import ExpiryInput from './ExpiryInput';
import StartTimeInput from './StartTimeInput';
import PermissionModeSelector, { PermissionMode } from './PermissionModeSelector';
import AmountPerSecondInput from './AmountPerSecondInput';
import InitialAmountInput from './InitialAmountInput';
import MaxAmountInput from './MaxAmountInput';

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
  // Permission mode: periodic or stream
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('periodic');
  
  // Default to native ETH
  const [token, setToken] = useState<TokenInfo>(
    defaultConfig?.permissionType && defaultConfig.permissionType.includes('erc20') && defaultConfig?.tokenAddress
      ? COMMON_TOKENS.find(t => t.address?.toLowerCase() === defaultConfig.tokenAddress!.toLowerCase()) || COMMON_TOKENS[0]
      : COMMON_TOKENS[0] // NATIVE_TOKEN is first
  );
  const [isCustomTokenSelected, setIsCustomTokenSelected] = useState(false);
  
  // Periodic fields
  const defaultAmount = defaultConfig?.amount || (token.isNative ? '0.000000000000000001' : '0.001');
  const [amount, setAmount] = useState(defaultAmount);
  const [periodDuration, setPeriodDuration] = useState(defaultConfig?.periodDuration || 86400);
  
  // Stream fields
  const [amountPerSecond, setAmountPerSecond] = useState(defaultConfig?.amountPerSecond || '0.0001');
  const [initialAmount, setInitialAmount] = useState(defaultConfig?.initialAmount || '0.1');
  const [maxAmount, setMaxAmount] = useState(defaultConfig?.maxAmount || '1');
  
  // Common fields
  const [startTime, setStartTime] = useState(defaultConfig?.startTime || Math.floor(Date.now() / 1000));
  const [expiry, setExpiry] = useState(defaultConfig?.expiry || Math.floor(Date.now() / 1000) + 604800);
  const [justification, setJustification] = useState(defaultConfig?.justification || '');
  const [isAdjustmentAllowed, setIsAdjustmentAllowed] = useState(defaultConfig?.isAdjustmentAllowed ?? true);
  const [chainId, setChainId] = useState(defaultConfig?.chainId || 11155111); // Sepolia

  useEffect(() => {
    if (defaultConfig?.permissionType) {
      // Set mode based on permission type
      if (defaultConfig.permissionType.includes('stream')) {
        setPermissionMode('stream');
      } else {
        setPermissionMode('periodic');
      }
      
      // Set token based on permission type
      if (defaultConfig.permissionType.includes('erc20') && defaultConfig?.tokenAddress) {
        const foundToken = COMMON_TOKENS.find(t => t.address?.toLowerCase() === defaultConfig.tokenAddress!.toLowerCase());
        if (foundToken) {
          setToken(foundToken);
        }
      }
    }
  }, [defaultConfig?.tokenAddress, defaultConfig?.permissionType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on permission mode
    if (permissionMode === 'periodic') {
      if (!amount || parseFloat(amount) <= 0) {
        alert('Please fill in all required fields');
        return;
      }
    } else {
      // Stream mode validation
      if (!amountPerSecond || parseFloat(amountPerSecond) <= 0) {
        alert('Amount per second must be greater than 0');
        return;
      }
      if (!initialAmount || parseFloat(initialAmount) < 0) {
        alert('Initial amount must be 0 or greater');
        return;
      }
      if (!maxAmount || parseFloat(maxAmount) <= 0) {
        alert('Maximum amount must be greater than 0');
        return;
      }
      if (parseFloat(initialAmount) > parseFloat(maxAmount)) {
        alert('Initial amount cannot exceed maximum amount');
        return;
      }
    }

    const isNative = token.isNative || token.address === null;
    
    let permissionType: PermissionType;
    if (permissionMode === 'periodic') {
      permissionType = isNative ? 'native-token-periodic' : 'erc20-token-periodic';
    } else {
      permissionType = isNative ? 'native-token-stream' : 'erc20-token-stream';
    }

    const config: PermissionConfig = {
      permissionType,
      tokenAddress: isNative ? undefined : token.address!,
      // Periodic fields
      amount: permissionMode === 'periodic' ? amount : undefined,
      periodDuration: permissionMode === 'periodic' ? periodDuration : undefined,
      // Stream fields
      amountPerSecond: permissionMode === 'stream' ? amountPerSecond : undefined,
      initialAmount: permissionMode === 'stream' ? initialAmount : undefined,
      maxAmount: permissionMode === 'stream' ? maxAmount : undefined,
      // Common fields
      tokenDecimals: token.decimals,
      startTime: permissionMode === 'stream' || isNative ? startTime : undefined,
      expiry,
      justification: justification || (
        permissionMode === 'periodic' 
          ? `Permission to transfer ${amount} ${token.symbol} every ${periodDuration} seconds`
          : `Permission to stream ${amountPerSecond} ${token.symbol}/second up to ${maxAmount} ${token.symbol}`
      ),
      isAdjustmentAllowed,
      chainId,
    };

    onSubmit(config);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
      <div className="step">
        <div className="step-title">🔐 Request Advanced Permission</div>
        <div className="step-description">
          Configure your ERC-7715 advanced permission request
        </div>
      </div>

      <PermissionModeSelector
        value={permissionMode}
        onChange={setPermissionMode}
        disabled={disabled}
      />

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
              // Update amount defaults when token changes
              if (permissionMode === 'periodic' && (amount === '0.001' || amount === '0.000000000000000001')) {
                setAmount(newToken.isNative ? '0.000000000000000001' : '0.001');
              }
            }}
            disabled={disabled}
          />
        </div>
        {permissionMode === 'periodic' && (
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
        )}
      </div>

      {permissionMode === 'periodic' ? (
        <>
          <PeriodDurationInput
            value={periodDuration}
            onChange={setPeriodDuration}
            disabled={disabled}
          />
        </>
      ) : (
        <>
          <AmountPerSecondInput
            value={amountPerSecond}
            onChange={setAmountPerSecond}
            tokenSymbol={token.symbol}
            disabled={disabled}
          />
          <InitialAmountInput
            value={initialAmount}
            onChange={setInitialAmount}
            tokenSymbol={token.symbol}
            disabled={disabled}
          />
          <MaxAmountInput
            value={maxAmount}
            onChange={setMaxAmount}
            tokenSymbol={token.symbol}
            disabled={disabled}
          />
        </>
      )}

      {/* StartTime for both native periodic and all stream types */}
      {(permissionMode === 'stream' || token.isNative) && (
        <StartTimeInput
          value={startTime}
          onChange={setStartTime}
          disabled={disabled}
        />
      )}

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
          placeholder={
            permissionMode === 'periodic'
              ? `e.g., Permission to transfer ${amount} ${token.symbol} every ${periodDuration} seconds`
              : `e.g., Permission to stream ${amountPerSecond} ${token.symbol}/second up to ${maxAmount} ${token.symbol}`
          }
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
        disabled={disabled || (!token.isNative && !token.address)}
      >
        Request Permission
      </button>
    </form>
  );
}

