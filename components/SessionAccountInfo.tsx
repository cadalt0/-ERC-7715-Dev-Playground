'use client';

import { SessionAccountInfo } from '@/hooks/useSessionAccount';

interface SessionAccountInfoProps {
  sessionAccountInfo: SessionAccountInfo | null;
}

export default function SessionAccountInfoDisplay({ sessionAccountInfo }: SessionAccountInfoProps) {
  if (!sessionAccountInfo) {
    return null;
  }

  const info = sessionAccountInfo as SessionAccountInfoExtended;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ 
        padding: '0.75rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Session Account:</strong>{' '}
          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {sessionAccountInfo.address}
          </span>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Balance:</strong>{' '}
          <span style={{ 
            color: sessionAccountInfo.isLowBalance ? '#dc3545' : '#28a745',
            fontWeight: 'bold'
          }}>
            {sessionAccountInfo.balanceEth} ETH
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          Estimated gas cost: ~{sessionAccountInfo.estimatedGasCostEth} ETH
        </div>
      </div>
      
      {info.rpcError && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #dc3545',
          borderRadius: '4px',
          color: '#721c24',
          marginTop: '0.5rem'
        }}>
          <strong>⚠️ RPC Error:</strong> {info.error || 'Could not fetch balance'}
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            Please check the balance manually on{' '}
            <a 
              href={`https://sepolia.etherscan.io/address/${info.address}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#721c24', textDecoration: 'underline' }}
            >
              Etherscan
            </a>
          </div>
        </div>
      )}

      {!info.rpcError && sessionAccountInfo.isLowBalance && sessionAccountInfo.warning && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404',
          marginTop: '0.5rem'
        }}>
          <strong>⚠️ Warning:</strong> {sessionAccountInfo.warning}
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            Redeem transaction might fail due to insufficient ETH for gas fees.
            Please send ETH to the session account address above.
          </div>
        </div>
      )}
    </div>
  );
}

