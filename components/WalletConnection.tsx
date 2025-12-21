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

  if (!isConnected) {
    return (
      <div className="wallet-connection-top-right">
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

