'use client';

import { useState } from 'react';
import { PermissionConfig } from '@/lib/metamask-permissions/types';

interface PermissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionAccountAddress: string | null;
  userAccountAddress: string | null;
  userAccountIsUpgraded: boolean | null;
  permissionsContext: string | null;
  delegationManager: string | null;
  config: PermissionConfig | null;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        backgroundColor: copied ? '#28a745' : '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '0.5rem',
      }}
    >
      {copied ? '✓ Copied' : `Copy ${label}`}
    </button>
  );
}

export default function PermissionDetailsModal({
  isOpen,
  onClose,
  sessionAccountAddress,
  userAccountAddress,
  userAccountIsUpgraded,
  permissionsContext,
  delegationManager,
  config,
}: PermissionDetailsModalProps) {
  if (!isOpen || !config || !permissionsContext || !delegationManager || !sessionAccountAddress) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1000,
        paddingTop: '6rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        paddingBottom: '2rem',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '700px',
          width: '100%',
          maxHeight: 'calc(100vh - 8rem)',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e0e0e0' }}>
          <h2 style={{ margin: 0, color: '#667eea', fontSize: '1.75rem', fontWeight: '700' }}>Permission Details</h2>
          <button
            onClick={onClose}
            style={{
              background: '#f5f5f5',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Session Account */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8f9ff', borderRadius: '12px', border: '1px solid #e8ecff' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
              Session Account
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#333', wordBreak: 'break-all' }}>
              {sessionAccountAddress}
              <CopyButton text={sessionAccountAddress} label="Address" />
            </div>
          </div>

          {/* User Account */}
          {userAccountAddress && (
            <div style={{ padding: '1.25rem', backgroundColor: '#f8f9ff', borderRadius: '12px', border: '1px solid #e8ecff' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                User Account
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: '#333', wordBreak: 'break-all', marginBottom: '0.5rem' }}>
                {userAccountAddress}
                <CopyButton text={userAccountAddress} label="Address" />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Is Upgraded:</span>{' '}
                <span style={{ color: userAccountIsUpgraded ? '#28a745' : '#dc3545', fontWeight: '600' }}>
                  {userAccountIsUpgraded ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}

          {/* Permission Config */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8f9ff', borderRadius: '12px', border: '1px solid #e8ecff' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
              Config
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Permission Type</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  {config.permissionType}
                </div>
              </div>

              {/* Periodic fields */}
              {config.amount && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Amount (Period)</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    {config.amount}
                  </div>
                </div>
              )}

              {config.periodDuration && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Period Duration</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    {config.periodDuration} seconds
                  </div>
                </div>
              )}

              {/* Stream fields */}
              {config.amountPerSecond && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Amount Per Second</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    {config.amountPerSecond}
                  </div>
                </div>
              )}

              {config.initialAmount && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Initial Amount</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    {config.initialAmount}
                  </div>
                </div>
              )}

              {config.maxAmount && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Maximum Amount</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    {config.maxAmount}
                  </div>
                </div>
              )}

              {config.startTime && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Start Time</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    {config.startTime} ({new Date(config.startTime * 1000).toLocaleString()})
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Expiry</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  {config.expiry} ({new Date(config.expiry * 1000).toLocaleString()})
                </div>
              </div>
            </div>
          </div>

          {/* Permission */}
          <div style={{ padding: '1.25rem', backgroundColor: '#f8f9ff', borderRadius: '12px', border: '1px solid #e8ecff' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#667eea', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
              Permission
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Delegation Manager</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#333', padding: '0.75rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', wordBreak: 'break-all' }}>
                  {delegationManager}
                  <CopyButton text={delegationManager} label="Copy" />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>Permissions Context</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#333', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e0e0e0', wordBreak: 'break-all', maxHeight: '200px', overflowY: 'auto' }}>
                  {permissionsContext}
                  <div style={{ marginTop: '0.5rem' }}>
                    <CopyButton text={permissionsContext} label="Copy" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

