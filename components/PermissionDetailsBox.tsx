'use client';

import { useState } from 'react';
import { PermissionConfig } from '@/lib/metamask-permissions/types';
import PermissionDetailsModal from './PermissionDetailsModal';

interface PermissionDetailsBoxProps {
  sessionAccountAddress: string | null;
  userAccountAddress: string | null;
  userAccountIsUpgraded: boolean | null;
  permissionsContext: string | null;
  delegationManager: string | null;
  config: PermissionConfig | null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${seconds / 60}m`;
  if (seconds < 86400) return `${seconds / 3600}h`;
  if (seconds < 604800) return `${seconds / 86400}d`;
  if (seconds < 2592000) return `${seconds / 604800}w`;
  return `${seconds / 2592000}mo`;
}

export default function PermissionDetailsBox({
  sessionAccountAddress,
  userAccountAddress,
  userAccountIsUpgraded,
  permissionsContext,
  delegationManager,
  config,
}: PermissionDetailsBoxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!permissionsContext || !delegationManager || !config || !sessionAccountAddress) {
    return null;
  }

  const tokenDisplay = config.tokenAddress 
    ? `${config.tokenAddress.slice(0, 6)}...${config.tokenAddress.slice(-4)}`
    : 'ETH';

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          border: '2px solid #667eea',
          borderRadius: '8px',
          backgroundColor: '#f8f9ff',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e8ecff';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9ff';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem' }}>✅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#667eea', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              Permission Granted
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4' }}>
              <div>{config.amount} {tokenDisplay}</div>
              <div style={{ marginTop: '0.125rem' }}>
                Every {formatDuration(config.periodDuration)} • Expires {new Date(config.expiry * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div style={{ color: '#667eea', fontSize: '1.25rem' }}>→</div>
        </div>
      </div>

      <PermissionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sessionAccountAddress={sessionAccountAddress}
        userAccountAddress={userAccountAddress}
        userAccountIsUpgraded={userAccountIsUpgraded}
        permissionsContext={permissionsContext}
        delegationManager={delegationManager}
        config={config}
      />
    </>
  );
}

