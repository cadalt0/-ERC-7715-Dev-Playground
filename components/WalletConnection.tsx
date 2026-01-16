'use client';

import { useState } from 'react';
import { useWeb3AuthConnect, useWeb3AuthDisconnect } from '@web3auth/modal/react';
import { useAccount, useBalance } from 'wagmi';

interface WalletConnectionProps {
  onDisconnect?: () => void;
}

export default function WalletConnection({ onDisconnect }: WalletConnectionProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { address: connectedAddress } = useAccount();
  const { data: balance } = useBalance({ address: connectedAddress });

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onDisconnect?.();
      setShowDropdown(false);
    } catch (error: any) {
      console.error('Disconnect failed:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const githubButton = (
    <a
      href="https://github.com/cadalt0/-ERC-7715-Dev-Playground"
      target="_blank"
      rel="noopener noreferrer"
      className="github-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        backgroundColor: '#24292e',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.2s',
        marginRight: '0.75rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#1b1f23';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#24292e';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      GitHub
    </a>
  );

  if (!isConnected) {
    return (
      <div className="wallet-connection-top-right">
        {githubButton}
        <button 
          onClick={() => connect()} 
          disabled={connectLoading}
          className="wallet-connect-btn"
        >
          {connectLoading ? (
            <>
              <span className="loading-small"></span>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
        {connectError && (
          <div className="wallet-error-tooltip">
            {connectError.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-connection-top-right">
      {githubButton}
      <div className="wallet-info-container">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="wallet-info-btn"
        >
          <div className="wallet-status-indicator"></div>
          <span className="wallet-address">{formatAddress(connectedAddress || '')}</span>
          <span className="wallet-dropdown-arrow">▼</span>
        </button>
        
        {showDropdown && (
          <div className="wallet-dropdown">
            <div className="wallet-dropdown-header">
              <div className="wallet-status-indicator active"></div>
              <div>
                <div className="wallet-dropdown-title">Connected</div>
                <div className="wallet-dropdown-subtitle">{connectorName}</div>
              </div>
            </div>
            
            <div className="wallet-dropdown-section">
              <div className="wallet-dropdown-label">Address</div>
              <div className="wallet-dropdown-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {connectedAddress}
              </div>
            </div>
            
            {balance && (
              <div className="wallet-dropdown-section">
                <div className="wallet-dropdown-label">Balance</div>
                <div className="wallet-dropdown-value">
                  {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </div>
              </div>
            )}
            
            <div className="wallet-dropdown-divider"></div>
            
            <button 
              onClick={handleDisconnect}
              disabled={disconnectLoading}
              className="wallet-disconnect-btn"
            >
              {disconnectLoading ? (
                <>
                  <span className="loading-small"></span>
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </button>
            
            {disconnectError && (
              <div className="wallet-error-message">
                {disconnectError.message}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="wallet-dropdown-overlay"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

