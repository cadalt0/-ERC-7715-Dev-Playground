'use client';

import { useState } from 'react';
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

  // Get token display name
  const tokenInfo = permissionConfig.tokenAddress
    ? COMMON_TOKENS.find(t => t.address?.toLowerCase() === permissionConfig.tokenAddress!.toLowerCase())
    : COMMON_TOKENS[0]; // Native ETH

  const tokenDisplay = tokenInfo
    ? tokenInfo.symbol
    : permissionConfig.tokenAddress
    ? `${permissionConfig.tokenAddress.slice(0, 6)}...${permissionConfig.tokenAddress.slice(-4)}`
    : 'ETH';

  const { amount } = permissionConfig;

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
        <div className="step-title">Redeem {amount} {tokenDisplay}</div>
        <div className="step-description">
          Uses the granted permission to send {amount} {tokenDisplay} to a recipient address
        </div>
      </div>

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
        disabled={redeeming || !permissionsContext || !delegationManager || !recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)}
        style={{ 
          marginBottom: '1rem',
          opacity: (sessionAccountInfo?.isLowBalance) ? 0.7 : 1,
        }}
      >
        {redeeming && <span className="loading"></span>}
        {redeeming ? `Redeeming ${amount} ${tokenDisplay}...` : `Redeem ${amount} ${tokenDisplay} with Permission`}
      </button>
    </>
  );
}

