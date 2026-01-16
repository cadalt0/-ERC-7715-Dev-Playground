'use client';

import { useState, useEffect } from 'react';
import { redeemPermissionViaBackend } from '@/lib/backend-redeem';
import { PermissionConfig, COMMON_TOKENS } from '@/lib/metamask-permissions/types';
import { SessionAccountInfo } from '@/hooks/useSessionAccount';

interface PermissionRedeemProps {
  permissionsContext: string | null;
  delegationManager: string | null;
  permissionConfig: PermissionConfig;
  sessionAccountInfo: SessionAccountInfo | null;
  onStatusChange: (status: { type: 'info' | 'success' | 'error'; message: string }) => void;
  onOutputChange: (output: string) => void;
}

export default function PermissionRedeem({
  permissionsContext,
  delegationManager,
  permissionConfig,
  sessionAccountInfo,
  onStatusChange,
  onOutputChange,
}: PermissionRedeemProps) {
  const [redeeming, setRedeeming] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [accruedAmount, setAccruedAmount] = useState<string | null>(null);

  // Get token display name
  const tokenInfo = permissionConfig.tokenAddress
    ? COMMON_TOKENS.find(t => t.address?.toLowerCase() === permissionConfig.tokenAddress!.toLowerCase())
    : COMMON_TOKENS[0]; // Native ETH

  const tokenDisplay = tokenInfo
    ? tokenInfo.symbol
    : permissionConfig.tokenAddress
    ? `${permissionConfig.tokenAddress.slice(0, 6)}...${permissionConfig.tokenAddress.slice(-4)}`
    : 'ETH';

  // Get amount display based on permission type
  const isPeriodic = permissionConfig.permissionType.includes('periodic');
  const isStream = permissionConfig.permissionType.includes('stream');
  
  // For periodic, use fixed amount. For stream, user must input amount; ensure we always have a string for validation.
  const defaultAmount = isPeriodic ? (permissionConfig.amount ?? '') : '';
  const amount = customAmount
    || defaultAmount
    || permissionConfig.maxAmount
    || permissionConfig.initialAmount
    || permissionConfig.amountPerSecond
    || '';
  
  // Calculate accrued amount for stream permissions
  const calculateAccruedAmount = () => {
    if (!isStream || !permissionConfig.startTime || !permissionConfig.amountPerSecond) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const startTime = permissionConfig.startTime;
    
    if (now < startTime) {
      return '0 (not started yet)';
    }
    
    const elapsed = now - startTime;
    const initialAmount = parseFloat(permissionConfig.initialAmount || '0');
    const ratePerSecond = parseFloat(permissionConfig.amountPerSecond || '0');
    const maxAmount = parseFloat(permissionConfig.maxAmount || '0');
    
    const accruedFromRate = elapsed * ratePerSecond;
    const totalAccrued = Math.min(initialAmount + accruedFromRate, maxAmount);
    
    return totalAccrued.toFixed(6);
  };
  
  // Auto-update accrued amount every 2 seconds
  useEffect(() => {
    // Calculate immediately on mount
    setAccruedAmount(calculateAccruedAmount());
    
    // Only set interval if this is a stream permission
    if (!isStream) return;
    
    const interval = setInterval(() => {
      setAccruedAmount(calculateAccruedAmount());
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isStream, permissionConfig.startTime, permissionConfig.amountPerSecond, permissionConfig.initialAmount, permissionConfig.maxAmount]);

  const handleRedeem = async () => {
    if (!permissionsContext || !delegationManager) {
      onStatusChange({ type: 'error', message: 'No permission found. Request permission first.' });
      return;
    }

    // Validate recipient address
    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      onStatusChange({ type: 'error', message: 'Please enter a valid recipient address (0x followed by 40 hex characters)' });
      return;
    }

    // Check balance before redeeming
    if (sessionAccountInfo?.isLowBalance) {
      const confirmed = window.confirm(
        `⚠️ Warning: Session account has low balance (${sessionAccountInfo.balanceEth} ETH). ` +
        `Redeem transaction might fail. Estimated gas cost: ~${sessionAccountInfo.estimatedGasCostEth} ETH. ` +
        `Continue anyway?`
      );
      if (!confirmed) {
        return;
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      onStatusChange({ type: 'error', message: 'Invalid amount to redeem. Please enter a valid amount.' });
      return;
    }

    setRedeeming(true);
    onOutputChange('');
    onStatusChange({
      type: 'info',
      message: `Redeeming ${amount} ${tokenDisplay}... Please wait.`,
    });

    try {
      // Call backend API instead of executing directly in browser
      const result = await redeemPermissionViaBackend(
        permissionsContext,
        delegationManager,
        recipient,
        amount,
        permissionConfig.permissionType,
        permissionConfig.tokenAddress,
        permissionConfig.tokenDecimals,
      );

      onStatusChange({
        type: 'success',
        message: `Redeem transaction sent! Hash: ${result.transactionHash}`,
      });
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      onOutputChange(`Redeem Error: ${errorMessage}`);
      onStatusChange({ type: 'error', message: errorMessage });
      console.error('Redeem permission failed:', error);
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <>
      <div className="step" style={{ marginTop: '1.5rem' }}>
        <div className="step-title">
          🎁 Redeem {isPeriodic ? `${amount} ${tokenDisplay}` : 'Tokens'}
          {isStream && <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '0.5rem' }}>(Stream Permission)</span>}
        </div>
        <div className="step-description">
          {isPeriodic && `Uses the granted periodic permission to send ${amount} ${tokenDisplay} to a recipient address`}
          {isStream && `Uses the granted stream permission to send tokens to a recipient address (up to accrued amount)`}
        </div>
      </div>

      {isStream && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#e8f4ff',
          border: '2px solid #007bff',
          borderRadius: '8px',
          color: '#004085',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          lineHeight: '1.6'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📊 Stream Info:</div>
          <div>• <strong>Accrual Rate:</strong> {permissionConfig.amountPerSecond} {tokenDisplay}/sec</div>
          <div>• <strong>Initial Amount:</strong> {permissionConfig.initialAmount} {tokenDisplay}</div>
          <div>• <strong>Max Cap:</strong> {permissionConfig.maxAmount} {tokenDisplay}</div>
          <div>• <strong>Start Time:</strong> {new Date((permissionConfig.startTime || 0) * 1000).toLocaleString()}</div>
          {accruedAmount && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#d4edff', borderRadius: '4px' }}>
              <strong>💰 Currently Available:</strong> ~{accruedAmount} {tokenDisplay}
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="redeem-recipient-input">
          Recipient Address <span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          id="redeem-recipient-input"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.trim())}
          disabled={redeeming}
          placeholder="0x..."
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'inherit',
            marginBottom: '1rem',
          }}
        />
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', marginBottom: '1rem' }}>
          The address that will receive the tokens
        </div>
      </div>

      {isStream && (
        <div className="form-group">
          <label htmlFor="redeem-amount-input">
            Amount to Redeem <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            id="redeem-amount-input"
            type="text"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            disabled={redeeming}
            placeholder={`e.g., ${accruedAmount || '0.001'} ${tokenDisplay}`}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              marginBottom: '0.5rem',
            }}
          />
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', marginBottom: '1rem' }}>
            Must be ≤ currently accrued amount (~{accruedAmount || '0'} {tokenDisplay})
          </div>
        </div>
      )}

      {sessionAccountInfo?.isLowBalance && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404',
          marginBottom: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <strong>⚠️ Low Balance Warning:</strong> Session account has insufficient ETH for gas fees.
          Redeem transaction might fail. Current balance: {sessionAccountInfo.balanceEth} ETH
        </div>
      )}

      <button
        onClick={handleRedeem}
        disabled={redeeming || !permissionsContext || !delegationManager || !recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient) || !amount || parseFloat(amount) <= 0}
        style={{ 
          marginBottom: '1rem',
          opacity: (sessionAccountInfo?.isLowBalance) ? 0.7 : 1,
        }}
      >
        {redeeming && <span className="loading"></span>}
        {redeeming ? `Redeeming ${amount} ${tokenDisplay}...` : `Redeem ${amount || '...'} ${tokenDisplay} with Permission`}
      </button>
    </>
  );
}

